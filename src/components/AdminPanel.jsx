import React, { useEffect, useState } from "react";
import {
    approveSubmission,
    deleteAdminResource,
    fetchAdminReports,
    fetchAdminSubmissions,
    rejectSubmission,
    resolveReport,
} from "../api";

export default function AdminPanel({ token }) {
    const [tab, setTab] = useState("submissions");
    const [submissions, setSubmissions] = useState([]);
    const [reports, setReports] = useState([]);
    const [submissionsPage, setSubmissionsPage] = useState(1);
    const [reportsPage, setReportsPage] = useState(1);
    const [submissionsHasNext, setSubmissionsHasNext] = useState(false);
    const [reportsHasNext, setReportsHasNext] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loadSubmissions = async (page = submissionsPage) => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchAdminSubmissions(token, "pending", page, 15);
            setSubmissions(data.items || []);
            setSubmissionsPage(data.page || page);
            setSubmissionsHasNext(!!data.hasNextPage);
        } catch (err) {
            setError(err.message || "Failed to load submissions");
        } finally {
            setLoading(false);
        }
    };

    const loadReports = async (page = reportsPage) => {
        setLoading(true);
        setError("");
        try {
            const data = await fetchAdminReports(token, "open", page, 15);
            setReports(data.items || []);
            setReportsPage(data.page || page);
            setReportsHasNext(!!data.hasNextPage);
        } catch (err) {
            setError(err.message || "Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === "submissions") loadSubmissions();
        if (tab === "reports") loadReports();
    }, [tab]);

    return (
        <section className="admin-deck">
            <div className="admin-deck__header">
                <div>
                    <p className="eyebrow">Moderation</p>
                    <h2>Admin Queue</h2>
                </div>
                <div className="admin-deck__tabs">
                    <button className={`admin-deck__tab${tab === "submissions" ? " admin-deck__tab--active" : ""}`} onClick={() => setTab("submissions")}>Submissions</button>
                    <button className={`admin-deck__tab${tab === "reports" ? " admin-deck__tab--active" : ""}`} onClick={() => setTab("reports")}>Reports</button>
                </div>
            </div>

            {loading && <p className="loading-message">Loading moderation queue...</p>}
            {error && <p className="error-message">{error}</p>}

            {tab === "submissions" && (
                <div className="admin-grid">
                    {!loading && submissions.length === 0 && <p className="empty-message">No pending submissions.</p>}
                    {submissions.map((item) => (
                        <article className="admin-card" key={item._id}>
                            <p className="admin-card__route">{item.courseid} / {item.topic} / {item.section}</p>
                            <a href={item.url} target="_blank" rel="noreferrer" className="admin-card__link">{item.url}</a>
                            <p className="admin-card__meta">By {item.submittedBy?.displayName || item.submittedBy?.email || "Unknown"}</p>
                            <div className="admin-card__actions">
                                <button className="action-chip action-chip--positive" onClick={async () => { await approveSubmission(token, item._id); await loadSubmissions(); }}>Approve</button>
                                <button className="action-chip action-chip--negative" onClick={async () => { const note = window.prompt("Optional rejection note") || ""; await rejectSubmission(token, item._id, note); await loadSubmissions(); }}>Reject</button>
                            </div>
                        </article>
                    ))}
                    <div className="admin-card__actions">
                        <button className="action-chip action-chip--ghost" disabled={submissionsPage <= 1 || loading} onClick={() => loadSubmissions(submissionsPage - 1)}>Previous</button>
                        <span className="admin-card__meta">Page {submissionsPage}</span>
                        <button className="action-chip action-chip--ghost" disabled={!submissionsHasNext || loading} onClick={() => loadSubmissions(submissionsPage + 1)}>Next</button>
                    </div>
                </div>
            )}

            {tab === "reports" && (
                <div className="admin-grid">
                    {!loading && reports.length === 0 && <p className="empty-message">No open reports.</p>}
                    {reports.map((item) => (
                        <article className="admin-card" key={item._id}>
                            <p className="admin-card__route">{item.courseid} / {item.topic} / {item.section}</p>
                            <a href={item.url} target="_blank" rel="noreferrer" className="admin-card__link">{item.url}</a>
                            <p className="admin-card__meta">Reason: {item.reason}</p>
                            {item.details ? <p className="admin-card__meta">Details: {item.details}</p> : null}
                            <div className="admin-card__actions">
                                <button className="action-chip action-chip--positive" onClick={async () => { await resolveReport(token, item._id, false); await loadReports(); }}>Resolve</button>
                                <button className="action-chip action-chip--ghost" onClick={async () => { await resolveReport(token, item._id, true); await loadReports(); }}>Dismiss</button>
                                <button
                                    className="action-chip action-chip--negative"
                                    onClick={async () => {
                                        const confirmed = window.confirm("Delete this resource link? This cannot be undone.");
                                        if (!confirmed) return;
                                        await deleteAdminResource(token, {
                                            courseid: item.courseid,
                                            topic: item.topic,
                                            section: item.section,
                                            url: item.url,
                                        });
                                        await loadReports();
                                    }}
                                >
                                    Delete Resource
                                </button>
                            </div>
                        </article>
                    ))}
                    <div className="admin-card__actions">
                        <button className="action-chip action-chip--ghost" disabled={reportsPage <= 1 || loading} onClick={() => loadReports(reportsPage - 1)}>Previous</button>
                        <span className="admin-card__meta">Page {reportsPage}</span>
                        <button className="action-chip action-chip--ghost" disabled={!reportsHasNext || loading} onClick={() => loadReports(reportsPage + 1)}>Next</button>
                    </div>
                </div>
            )}
        </section>
    );
}
