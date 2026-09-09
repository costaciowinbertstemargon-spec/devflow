const API_URL = "http://localhost:5000/api";

interface ApiResponse<T> {
    status: string;
    message?: string;
    [key: string]: unknown;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

interface ProjectsResponse extends ApiResponse<Project[]> {
    projects: Project[];
}

export async function getProjects(
    organizationId: string,
    token: string
): Promise<Project[]> {
    const response = await fetch(
        `${API_URL}/organizations/${organizationId}/projects`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        }
    );

    const data = 
        (await response.json()) as ProjectsResponse;
    
    if (!response.ok) {
        throw new Error(
            data.message || "Failed to retrieve projects"
        );
    }

    return data.projects;
}

{/* Login */}

export interface User {
    id: string;
    email: string;
}

export interface LoginResponse {
    status: string;
    message?: string;
    token: string;
    user: User;
}

export async function login(
    email: string,
    password: string    
): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
        cache: "no-store",
    });

    const data = (await response.json()) as LoginResponse;

    if (!response.ok) {
        throw new Error(
            data.message || "Login failed"
        );
    }

    return data;
}

{/* Get Me */}

export interface CurrentUser {
    id: string;
    name: string;
    email: string;
    createdAt: string;
}

export interface MeResponse {
    status: string;
    message?: string;
    user: CurrentUser;
}

export async function getMe(
    token: string
): Promise<CurrentUser> {
    const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        cache: "no-store",
    });

    const data = (await response.json()) as MeResponse;

    if (!response.ok) {
        throw new Error(
            data.message || "Failed to retrieve current user"
        );
    }

    return data.user;
}