import React from "react";
import ResourceCard from "./ResourceCard";
import SubmitResourceForm from "./SubmitResourceForm";

export default function TopicWorkbench({
    selectedCourse,
    selectedTopic,
    selectedSection,
    selectedSectionLabel,
    openSectionLinks,
    loadingTopics,
    topicError,
    loadingResources,
    resourceError,
    sectionOrder,
    sectionLabels,
    groupedResources,
    onSelectSection,
    token,
    user,
    onLike,
    onDislike,
    onDescriptionSave,
    onReport,
    onDelete,
    onSubmitResource,
    onSignIn,
}) {
    if (!selectedCourse) {
        return (
            <div className="empty-stage">
                <p className="eyebrow">Start here</p>
                <h2>Select a course to open its topic library.</h2>
                <p>Pick a course from the left, then choose a topic to view its resources.</p>
            </div>
        );
    }

    return (
        <>
            <header className="course-stage__head">
                <div>
                    <p className="eyebrow">Active Course</p>
                    <h2 className="course-stage__title">{selectedCourse.coursename}</h2>
                    <p className="course-stage__meta">{selectedCourse.courseid} · {selectedCourse.numberOfTopics} topics</p>
                </div>
            </header>

            {loadingTopics && <p className="loading-message">Loading course structure...</p>}
            {topicError && <p className="error-message">{topicError}</p>}

            {!selectedTopic ? (
                <div className="empty-stage empty-stage--topic-prompt">
                    <p className="eyebrow">Topic</p>
                    <h2>Select a topic from the tree to the left.</h2>
                    <p>The course is loaded. The topic tree is now the main navigation path.</p>
                </div>
            ) : (
                <section className="topic-workbench">
                    <div className="topic-workbench__head">
                        <div>
                            <p className="eyebrow">Topic</p>
                            <h3>{selectedTopic}</h3>
                        </div>
                        <div className="topic-workbench__metric">
                            <span>Open Section</span>
                            <strong>{selectedSectionLabel}</strong>
                            <small>{openSectionLinks} links</small>
                        </div>
                    </div>

                    {loadingResources && <p className="loading-message">Loading resources...</p>}
                    {resourceError && <p className="error-message">{resourceError}</p>}

                    {!loadingResources && !resourceError && (
                        <div className="section-browser">
                            <aside className="section-browser__nav">
                                {sectionOrder.map((section) => (
                                    <button
                                        key={section}
                                        className={`section-browser__tab${selectedSection === section ? " section-browser__tab--active" : ""}`}
                                        onClick={() => onSelectSection(section)}
                                    >
                                        <span>{sectionLabels[section]}</span>
                                        <span>{groupedResources[section]?.length || 0}</span>
                                    </button>
                                ))}
                            </aside>

                            <div className="section-browser__content">
                                <div className="section-browser__hero">
                                    <div>
                                        <p className="eyebrow">Section</p>
                                        <h4>{selectedSectionLabel}</h4>
                                    </div>
                                    <p>
                                        Links in this section are grouped together for faster review.
                                    </p>
                                </div>

                                {groupedResources[selectedSection]?.length ? (
                                    <div className="resource-stack">
                                        {groupedResources[selectedSection].map((resource) => (
                                            <ResourceCard
                                                key={`${resource.section}-${resource.url}`}
                                                resource={resource}
                                                courseid={selectedCourse.courseid}
                                                topic={selectedTopic}
                                                token={token}
                                                onLike={onLike}
                                                onDislike={onDislike}
                                                onDescriptionSave={onDescriptionSave}
                                                onReport={onReport}
                                                canDelete={user?.role === "admin"}
                                                onDelete={onDelete}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-section">
                                        <h5>No published links in this section yet.</h5>
                                        <p>Use the contribution panel below to submit one for moderation.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {token ? (
                        <SubmitResourceForm
                            token={token}
                            defaultSection={selectedSection}
                            onSubmit={onSubmitResource}
                        />
                    ) : (
                        <div className="signin-callout">
                            <p>Sign in to vote, annotate resources, submit links, and report low-quality material.</p>
                            <button className="auth-strip__button" onClick={onSignIn}>Unlock participation</button>
                        </div>
                    )}
                </section>
            )}
        </>
    );
}
