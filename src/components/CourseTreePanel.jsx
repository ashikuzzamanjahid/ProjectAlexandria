import React from "react";

export default function CourseTreePanel({
    user,
    onLogout,
    onSignIn,
    searchQuery,
    onSearch,
    loadingCourses,
    courseError,
    filteredCourses,
    expandedCourses,
    courseDetailsById,
    selectedCourse,
    selectedTopic,
    onCourseToggle,
    onCourseSelect,
    onTopicSelect,
}) {
    return (
        <aside className="navigation-panel glass-card">
            <div className="panel-head">
                <div>
                    <p className="eyebrow">Explorer</p>
                    <h2 className="panel-title">Course Map</h2>
                </div>
                <div className="auth-strip">
                    {user ? (
                        <>
                            <span className="auth-strip__user">{user.displayName || user.email}</span>
                            <button className="auth-strip__button auth-strip__button--ghost" onClick={onLogout}>Sign out</button>
                        </>
                    ) : (
                        <button className="auth-strip__button" onClick={onSignIn}>Sign in</button>
                    )}
                </div>
            </div>

            <input
                type="text"
                className="search-field"
                value={searchQuery}
                onChange={onSearch}
                placeholder="Search by course name or code"
            />

            {loadingCourses && <p className="loading-message">Loading courses...</p>}
            {courseError && <p className="error-message">{courseError}</p>}

            <div className="tree-map">
                <div className="tree-map__root">
                    <span className="tree-map__caret">▾</span>
                    <span className="tree-map__label tree-map__label--root">All</span>
                    <span className="tree-map__count">{filteredCourses.length}</span>
                </div>

                <div className="tree-map__branch-list">
                    {filteredCourses.map((course) => {
                        const isExpanded = !!expandedCourses[course.courseid];
                        const details = courseDetailsById[course.courseid];
                        const topics = details?.topics || [];
                        const isSelectedCourse = selectedCourse?.courseid === course.courseid;

                        return (
                            <div className="tree-map__branch" key={course.courseid}>
                                <div className="tree-map__row">
                                    <button
                                        type="button"
                                        className="tree-map__toggle"
                                        onClick={() => onCourseToggle(course.courseid)}
                                        aria-label={isExpanded ? `Collapse ${course.courseid}` : `Expand ${course.courseid}`}
                                    >
                                        {isExpanded ? "▾" : "▸"}
                                    </button>
                                    <button
                                        type="button"
                                        className={`tree-map__node${isSelectedCourse ? " tree-map__node--active" : ""}`}
                                        onClick={() => onCourseSelect(course.courseid)}
                                    >
                                        <span className="tree-map__folder">□</span>
                                        <span className="tree-map__label">{course.courseid}</span>
                                    </button>
                                    <span className="tree-map__count">{details?.numberOfTopics ?? course.numberOfTopics ?? 0}</span>
                                </div>

                                {isExpanded && topics.length > 0 && (
                                    <div className="tree-map__children">
                                        {topics.map((topic) => (
                                            <div className="tree-map__row tree-map__row--child" key={`${course.courseid}-${topic}`}>
                                                <span className="tree-map__spacer" />
                                                <button
                                                    type="button"
                                                    className={`tree-map__node tree-map__node--topic${selectedCourse?.courseid === course.courseid && selectedTopic === topic ? " tree-map__node--active" : ""}`}
                                                    onClick={() => onTopicSelect(course.courseid, topic)}
                                                >
                                                    <span className="tree-map__leaf">□</span>
                                                    <span className="tree-map__label">{topic}</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}
