import React, { useEffect, useMemo, useState } from "react";

const getVoteKey = ({ courseid, topic, section, url }) =>
    `voted_${courseid}_${topic}_${section}_${url}`;

export default function ResourceCard({
    resource,
    courseid,
    topic,
    token,
    onLike,
    onDislike,
    onDescriptionSave,
    onReport,
    canDelete = false,
    onDelete,
}) {
    const [description, setDescription] = useState(resource.description || "");
    const [saveStatus, setSaveStatus] = useState("");
    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState("broken");
    const [reportDetails, setReportDetails] = useState("");
    const [reportStatus, setReportStatus] = useState("");
    const voteKey = useMemo(
        () => getVoteKey({ courseid, topic, section: resource.section, url: resource.url }),
        [courseid, topic, resource.section, resource.url]
    );
    const [userVote, setUserVote] = useState(() => localStorage.getItem(voteKey));

    useEffect(() => {
        setDescription(resource.description || "");
    }, [resource.description]);

    useEffect(() => {
        setUserVote(localStorage.getItem(voteKey));
    }, [voteKey]);

    const handleLike = async () => {
        if (!token || userVote) return;
        try {
            const likes = await onLike(resource);
            setUserVote("like");
            localStorage.setItem(voteKey, "like");
            return likes;
        } catch {
            return null;
        }
    };

    const handleDislike = async () => {
        if (!token || userVote) return;
        try {
            const dislikes = await onDislike(resource);
            setUserVote("dislike");
            localStorage.setItem(voteKey, "dislike");
            return dislikes;
        } catch {
            return null;
        }
    };

    const handleDescriptionBlur = async () => {
        if (!token || description === (resource.description || "")) return;
        setSaveStatus("saving");
        try {
            await onDescriptionSave(resource, description);
            setSaveStatus("saved");
            window.setTimeout(() => setSaveStatus(""), 1800);
        } catch {
            setSaveStatus("error");
        }
    };

    const handleReportSubmit = async (event) => {
        event.preventDefault();
        if (!token) return;
        try {
            await onReport(resource, { reason: reportReason, details: reportDetails });
            setReportStatus("Report sent");
            setReportOpen(false);
            setReportDetails("");
            window.setTimeout(() => setReportStatus(""), 1800);
        } catch {
            setReportStatus("Report failed");
        }
    };

    return (
        <article className="resource-card">
            <div className="resource-card__head">
                <span className={`resource-card__badge resource-card__badge--${resource.section}`}>
                    {resource.section}
                </span>
                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="resource-card__link">
                    {resource.url}
                </a>
            </div>

            <div className="resource-card__body">
                <textarea
                    className="resource-card__description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={handleDescriptionBlur}
                    readOnly={!token}
                    placeholder={token ? "Add practical notes about this resource" : "Sign in to annotate this resource"}
                />
                {saveStatus && <span className={`resource-card__status resource-card__status--${saveStatus}`}>{saveStatus}</span>}
            </div>

            <div className="resource-card__footer">
                <div className="resource-card__votes">
                    <button
                        className={`action-chip action-chip--positive${userVote === "like" ? " action-chip--active" : ""}`}
                        disabled={!token || !!userVote}
                        onClick={handleLike}
                    >
                        Useful
                    </button>
                    <span className="vote-pill">{resource.likes}</span>
                    <button
                        className={`action-chip action-chip--negative${userVote === "dislike" ? " action-chip--active" : ""}`}
                        disabled={!token || !!userVote}
                        onClick={handleDislike}
                    >
                        Weak
                    </button>
                    <span className="vote-pill">{resource.dislikes}</span>
                </div>

                <div className="resource-card__controls">
                    {token && (
                        <button className="action-chip action-chip--ghost" onClick={() => setReportOpen((value) => !value)}>
                            Report
                        </button>
                    )}
                    {canDelete && (
                        <button
                            className="action-chip action-chip--negative"
                            onClick={async () => {
                                const confirmed = window.confirm("Delete this resource link? This cannot be undone.");
                                if (!confirmed) return;
                                await onDelete(resource);
                            }}
                        >
                            Delete
                        </button>
                    )}
                    {userVote && <span className="resource-card__meta">You voted: {userVote}</span>}
                    {reportStatus && <span className="resource-card__meta">{reportStatus}</span>}
                </div>
            </div>

            {reportOpen && (
                <form className="report-sheet" onSubmit={handleReportSubmit}>
                    <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="report-sheet__select">
                        <option value="broken">Broken</option>
                        <option value="spam">Spam</option>
                        <option value="inaccurate">Inaccurate</option>
                        <option value="outdated">Outdated</option>
                    </select>
                    <input
                        className="report-sheet__input"
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        placeholder="Optional details"
                    />
                    <button className="action-chip action-chip--ghost" type="submit">Send report</button>
                </form>
            )}
        </article>
    );
}
