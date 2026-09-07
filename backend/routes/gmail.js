const express = require("express");
const { google } = require("googleapis");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Helper: create an authenticated OAuth2 client for the user
const getGmailClient = (user) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`
    );
    oauth2Client.setCredentials({
        access_token: user.accessToken,
        refresh_token: user.refreshToken,
    });
    return oauth2Client;
};

// Helper: decode base64 email body
const decodeBody = (data) => {
    if (!data) return "";
    const buff = Buffer.from(data, "base64");
    return buff.toString("utf-8");
};

// Helper: get plain text from email payload
const getEmailBody = (payload) => {
    if (!payload) return "";

    // Simple body (non-multipart)
    if (payload.body && payload.body.data) {
        return decodeBody(payload.body.data);
    }

    // Multipart: recursively look for text/plain or text/html
    if (payload.parts && payload.parts.length > 0) {
        for (const part of payload.parts) {
            if (part.mimeType === "text/plain" && part.body?.data) {
                return decodeBody(part.body.data);
            }
        }
        // Fallback to text/html
        for (const part of payload.parts) {
            if (part.mimeType === "text/html" && part.body?.data) {
                return decodeBody(part.body.data);
            }
            // Recursively handle nested parts
            if (part.parts) {
                const nested = getEmailBody(part);
                if (nested) return nested;
            }
        }
    }

    return "";
};

// @route   GET /api/gmail/search?q=<keyword>
// @access  Protected
router.get("/search", protect, async (req, res) => {
    const keyword = req.query.q || "";

    try {
        const auth = getGmailClient(req.user);
        const gmail = google.gmail({ version: "v1", auth });

        // Ensure a valid subject is used for reply requests.
        const safeSubject = (req.body?.subject || "No Subject").toString();

        // Step 1: Search for message IDs matching the keyword (if any)
        const listParams = { userId: "me", maxResults: 20 };
        if (keyword.trim() !== "") {
            listParams.q = keyword;
        }

        const listResponse = await gmail.users.messages.list(listParams);

        const messages = listResponse.data.messages;

        if (!messages || messages.length === 0) {
            return res.json({ emails: [], total: 0 });
        }

        // Step 2: Fetch details of each message
        const emailDetails = await Promise.all(
            messages.map(async (msg) => {
                const msgData = await gmail.users.messages.get({
                    userId: "me",
                    id: msg.id,
                    format: "full",
                });

                const headers = msgData.data.payload?.headers || [];
                const getHeader = (name) =>
                    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

                const subject = getHeader("Subject") || "(No Subject)";
                const from = getHeader("From") || "Unknown Sender";
                const date = getHeader("Date") || "";
                const messageId = getHeader("Message-ID") || "";
                const references = getHeader("References") || "";
                const snippet = msgData.data.snippet || "";
                const body = getEmailBody(msgData.data.payload);

                return {
                    id: msg.id,
                    threadId: msgData.data.threadId,
                    subject,
                    from,
                    date,
                    messageId,
                    references,
                    snippet,
                    body,
                };
            })
        );

        res.json({ emails: emailDetails, total: emailDetails.length });
    } catch (error) {
        console.error("Gmail API error:", error.message);
        if (error.code === 401) {
            return res.status(401).json({ message: "Gmail access token expired. Please log in again." });
        }
        res.status(500).json({ message: "Failed to fetch emails. Please try again." });
    }
});

// @route   POST /api/gmail/reply/:id
// @desc    Reply to an email
// @access  Protected
router.post("/reply/:id", protect, async (req, res) => {
    const { replyText, to, subject, threadId, messageId, references } = req.body;

    if (!replyText) {
        return res.status(400).json({ message: "Reply text is required" });
    }

    try {
        const auth = getGmailClient(req.user);
        const gmail = google.gmail({ version: "v1", auth });

        const safeSubject = (subject || "No Subject").toString();
        const replySubject = safeSubject.toLowerCase().startsWith("re:") ? safeSubject : `Re: ${safeSubject}`;
        const utf8Subject = `=?utf-8?B?${Buffer.from(replySubject).toString("base64")}?=`;

        // Proper thread references
        const replyReferences = references ? `${references} ${messageId}` : messageId;

        const messageParts = [
            `To: ${to}`,
            `Subject: ${utf8Subject}`,
            `In-Reply-To: ${messageId}`,
            `References: ${replyReferences}`,
            `Content-Type: text/plain; charset="UTF-8"`,
            ``,
            replyText
        ];

        const rawMessage = messageParts.join("\n");
        const encodedMessage = Buffer.from(rawMessage)
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "");

        const response = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
                threadId: threadId
            }
        });

        res.json({ success: true, message: "Reply sent successfully", data: response.data });
    } catch (error) {
        console.error("Gmail Reply API error:", error.message);
        if (error.code === 401) {
            return res.status(401).json({ message: "Gmail access token expired. Please log in again." });
        }
        res.status(500).json({ message: "Failed to send reply. Please try again." });
    }
});

module.exports = router;
