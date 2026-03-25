import { useMemo, useState } from "react";
import {
    deleteAdminResource,
    dislikeResource,
    fetchCourseDetails,
    fetchResourcesByTopic,
    likeResource,
    reportResource,
    submitResource,
    updateResourceDescription,
} from "../api";
import { SECTION_ORDER } from "../constants/librarySections";

export default function useLibraryWorkbench(token) {
    const [courseDetailsById, setCourseDetailsById] = useState({});
    const [expandedCourses, setExpandedCourses] = useState({});
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSection, setSelectedSection] = useState("videos");
    const [resources, setResources] = useState([]);

    const [loadingTopics, setLoadingTopics] = useState(false);
    const [loadingResources, setLoadingResources] = useState(false);
    const [topicError, setTopicError] = useState("");
    const [resourceError, setResourceError] = useState("");

    const groupedResources = useMemo(() => {
        return SECTION_ORDER.reduce((accumulator, section) => {
            accumulator[section] = resources.filter((item) => (item.section || "resources") === section);
            return accumulator;
        }, {});
    }, [resources]);

    const ensureCourseDetails = async (courseid) => {
        if (courseDetailsById[courseid]) {
            return courseDetailsById[courseid];
        }

        const data = await fetchCourseDetails(courseid);
        setCourseDetailsById((current) => ({ ...current, [courseid]: data }));
        return data;
    };

    const handleCourseSelect = async (courseid) => {
        setSelectedTopic(null);
        setSelectedSection("videos");
        setResources([]);
        setLoadingTopics(true);
        setTopicError("");
        setExpandedCourses((current) => ({ ...current, [courseid]: true }));
        try {
            const data = await ensureCourseDetails(courseid);
            setSelectedCourse(data);
        } catch {
            setTopicError("Could not load course topics.");
        } finally {
            setLoadingTopics(false);
        }
    };

    const handleCourseToggle = async (courseid) => {
        const isExpanded = !!expandedCourses[courseid];
        if (isExpanded) {
            setExpandedCourses((current) => ({ ...current, [courseid]: false }));
            return;
        }

        setExpandedCourses((current) => ({ ...current, [courseid]: true }));
        if (!courseDetailsById[courseid]) {
            setLoadingTopics(true);
            setTopicError("");
            try {
                await ensureCourseDetails(courseid);
            } catch {
                setTopicError("Could not load course topics.");
            } finally {
                setLoadingTopics(false);
            }
        }
    };

    const loadTopicResources = async (courseid, topic) => {
        setLoadingResources(true);
        setResourceError("");
        try {
            const data = await fetchResourcesByTopic(courseid, topic);
            setResources(data);
            const firstSection = SECTION_ORDER.find((section) =>
                data.some((item) => (item.section || "resources") === section)
            ) || "videos";
            setSelectedSection(firstSection);
        } catch {
            setResources([]);
            setResourceError("Could not load topic resources.");
        } finally {
            setLoadingResources(false);
        }
    };

    const handleTreeTopicSelect = async (courseid, topic) => {
        setLoadingTopics(true);
        setTopicError("");
        setExpandedCourses((current) => ({ ...current, [courseid]: true }));
        try {
            const course = await ensureCourseDetails(courseid);
            setSelectedCourse(course);
            setSelectedTopic(topic);
            await loadTopicResources(courseid, topic);
        } catch {
            setTopicError("Could not load course topics.");
        } finally {
            setLoadingTopics(false);
        }
    };

    const updateResourceInState = (resource, updater) => {
        setResources((current) =>
            current.map((item) => {
                if (item.url === resource.url && item.section === resource.section) {
                    return updater(item);
                }
                return item;
            })
        );
    };

    const removeResourceFromState = (resource) => {
        setResources((current) =>
            current.filter((item) => !(item.url === resource.url && item.section === resource.section))
        );
    };

    const handleLike = async (resource) => {
        const likes = await likeResource(selectedCourse.courseid, selectedTopic, resource.url, resource.section, token);
        updateResourceInState(resource, (item) => ({ ...item, likes }));
        return likes;
    };

    const handleDislike = async (resource) => {
        const dislikes = await dislikeResource(selectedCourse.courseid, selectedTopic, resource.url, resource.section, token);
        updateResourceInState(resource, (item) => ({ ...item, dislikes }));
        return dislikes;
    };

    const handleDescriptionSave = async (resource, description) => {
        const saved = await updateResourceDescription(
            selectedCourse.courseid,
            selectedTopic,
            resource.url,
            resource.section,
            description,
            token
        );
        updateResourceInState(resource, (item) => ({ ...item, description: saved }));
    };

    const handleReport = async (resource, payload) => {
        await reportResource(selectedCourse.courseid, selectedTopic, {
            url: resource.url,
            section: resource.section,
            reason: payload.reason,
            details: payload.details,
        }, token);
    };

    const handleSubmitResource = async ({ url, section }) => {
        if (!selectedCourse || !selectedTopic) return;
        await submitResource(selectedCourse.courseid, selectedTopic, url, token, section);
    };

    const handleAdminDelete = async (resource) => {
        if (!selectedCourse || !selectedTopic) return;
        await deleteAdminResource(token, {
            courseid: selectedCourse.courseid,
            topic: selectedTopic,
            section: resource.section,
            url: resource.url,
        });
        removeResourceFromState(resource);
    };

    return {
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
    };
}
