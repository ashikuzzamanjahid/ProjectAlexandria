import React, { useEffect, useState } from "react";
import { SECTION_ORDER } from "../constants/librarySections";

export default function SubmitResourceForm({ token, defaultSection = "resources", onSubmit }) {
    const [section, setSection] = useState(defaultSection);
    const [url, setUrl] = useState("");
    const [status, setStatus] = useState("");

    useEffect(() => {
        setSection(defaultSection);
    }, [defaultSection]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!token || !url.trim()) return;
        setStatus("submitting");
        try {
            await onSubmit({ url: url.trim(), section });
            setUrl("");
            setStatus("submitted");
            window.setTimeout(() => setStatus(""), 2000);
        } catch {
            setStatus("error");
        }
    };

    return (
        <form className="submission-panel" onSubmit={handleSubmit}>
            <div className="submission-panel__header">
                <h4>Contribute a Resource</h4>
                <p>Your submission goes to admin review before it is published.</p>
            </div>
            <div className="submission-panel__controls">
                <select className="submission-panel__field" value={section} onChange={(e) => setSection(e.target.value)}>
                    {SECTION_ORDER.map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
                <input
                    className="submission-panel__field submission-panel__field--wide"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste a high-quality link"
                    required
                />
                <button className="submission-panel__button" type="submit" disabled={!token || status === "submitting"}>
                    {status === "submitting" ? "Submitting" : "Submit"}
                </button>
            </div>
            {status === "submitted" && <span className="submission-panel__status submission-panel__status--ok">Submitted for review.</span>}
            {status === "error" && <span className="submission-panel__status submission-panel__status--error">Submission failed.</span>}
        </form>
    );
}
