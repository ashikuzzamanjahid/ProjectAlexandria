import React, { useState } from "react";
import AuthForm from "./AuthForm";
import AdminPanel from "./components/AdminPanel";
import CourseTreePanel from "./components/CourseTreePanel";
import TopicWorkbench from "./components/TopicWorkbench";
import useAuthSession from "./hooks/useAuthSession";
import useCourseCatalog from "./hooks/useCourseCatalog";
import useLibraryWorkbench from "./hooks/useLibraryWorkbench";
import { SECTION_LABEL } from "./constants/librarySections";
import "./Library.css";
import "./AuthForm.css";

export default function Library() {
    const { token, user, onAuthSuccess, logout } = useAuthSession();
    const {
        courses,
        filteredCourses,
        searchQuery,
        loadingCourses,
        courseError,
        handleSearch,
    } = useCourseCatalog();
    const [showAuth, setShowAuth] = useState(false);

    const {
        SECTION_ORDER,
        courseDetailsById,
        expandedCourses,
        selectedCourse,
        selectedTopic,
        selectedSection,
        resources,
        groupedResources,
        loadingTopics,
        loadingResources,
        topicError,
        resourceError,
        setSelectedSection,
        handleCourseSelect,
        handleCourseToggle,
        handleTreeTopicSelect,
        handleLike,
        handleDislike,
        handleDescriptionSave,
        handleReport,
        handleSubmitResource,
        handleAdminDelete,
    } = useLibraryWorkbench(token);

    const totalLinks = resources.length;
    const totalTopics = selectedCourse?.topics?.length || 0;
    const openSectionLinks = groupedResources[selectedSection]?.length || 0;

    const handleAuthSuccess = (newToken, email, displayName, role = "student") => {
        onAuthSuccess(newToken, email, displayName, role);
        setShowAuth(false);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <div className="alexandria-shell">
            <div className="alexandria-backdrop" />

            {showAuth && <AuthForm onSuccess={handleAuthSuccess} onClose={() => setShowAuth(false)} />}

            <main className="alexandria-app">
                <section className="hero-band">
                    <div>
                        <p className="eyebrow">Resource Library</p>
                        <h1 className="hero-title">Project Alexandria</h1>
                        <p className="hero-copy">
                            Browse courses, open a topic, and work through the best links by section.
                        </p>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="hero-stat__label">Courses</span>
                            <strong>{courses.length}</strong>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat__label">Topics</span>
                            <strong>{totalTopics}</strong>
                        </div>
                        <div className="hero-stat">
                            <span className="hero-stat__label">Visible Links</span>
                            <strong>{totalLinks}</strong>
                        </div>
                    </div>
                </section>

                <section className="workspace-grid">
                    <CourseTreePanel
                        user={user}
                        onLogout={handleLogout}
                        onSignIn={() => setShowAuth(true)}
                        searchQuery={searchQuery}
                        onSearch={handleSearch}
                        loadingCourses={loadingCourses}
                        courseError={courseError}
                        filteredCourses={filteredCourses}
                        expandedCourses={expandedCourses}
                        courseDetailsById={courseDetailsById}
                        selectedCourse={selectedCourse}
                        selectedTopic={selectedTopic}
                        onCourseToggle={handleCourseToggle}
                        onCourseSelect={handleCourseSelect}
                        onTopicSelect={handleTreeTopicSelect}
                    />

                    <section className="content-panel glass-card">
                        {user?.role === "admin" && token && <AdminPanel token={token} />}
                        <TopicWorkbench
                            selectedCourse={selectedCourse}
                            selectedTopic={selectedTopic}
                            selectedSection={selectedSection}
                            selectedSectionLabel={SECTION_LABEL[selectedSection]}
                            openSectionLinks={openSectionLinks}
                            loadingTopics={loadingTopics}
                            topicError={topicError}
                            loadingResources={loadingResources}
                            resourceError={resourceError}
                            sectionOrder={SECTION_ORDER}
                            sectionLabels={SECTION_LABEL}
                            groupedResources={groupedResources}
                            onSelectSection={setSelectedSection}
                            token={token}
                            user={user}
                            onLike={handleLike}
                            onDislike={handleDislike}
                            onDescriptionSave={handleDescriptionSave}
                            onReport={handleReport}
                            onDelete={handleAdminDelete}
                            onSubmitResource={handleSubmitResource}
                            onSignIn={() => setShowAuth(true)}
                        />
                    </section>
                </section>
            </main>
        </div>
    );
}
