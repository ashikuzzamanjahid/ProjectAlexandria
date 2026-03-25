import { useEffect, useState } from "react";
import { fetchCourses } from "../api";

export default function useCourseCatalog() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [courseError, setCourseError] = useState("");

    useEffect(() => {
        const loadCourses = async () => {
            setLoadingCourses(true);
            setCourseError("");
            try {
                const data = await fetchCourses();
                setCourses(data);
                setFilteredCourses(data);
            } catch {
                setCourseError("Could not load courses. Make sure the backend is running.");
            } finally {
                setLoadingCourses(false);
            }
        };

        loadCourses();
    }, []);

    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
        setFilteredCourses(
            courses.filter((course) =>
                course.coursename.toLowerCase().includes(query) ||
                course.courseid.toLowerCase().includes(query)
            )
        );
    };

    return {
        courses,
        filteredCourses,
        searchQuery,
        loadingCourses,
        courseError,
        handleSearch,
    };
}
