const API_URL = "http://localhost:5000/api";

interface ApiResponse<T> {
    status: string;
    message?: string;
    [key: string]: unknown;
}

{/* Get Project */}

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

export async function getProject(
    projectId: string,
    token: string
): Promise<Project> {
    const response = await fetch(
        `${API_URL}/projects/${projectId}`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    const data =
        (await response.json()) as {
            status?: string;
            message?: string;
            project?: Project;
        };

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to load project"
        );
    }

    if (!data.project) {
        throw new Error("Project data was not returned.");
    }

    return data.project;
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

{/* Organization */}

export interface Organization {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationsResponse {
    status: string;
    message?: string;
    organizations: Organization[];
}

export async function getOrganizations(
    token: string
): Promise<Organization[]> {
    const response = await fetch(
        `${API_URL}/organizations`,
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
        (await response.json()) as OrganizationsResponse;

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to retrieve organizations"
        );
    }

    return data.organizations;
}

{/* Creating Projects */}

export interface CreateProjectResponse {
    status: string;
    message?: string;
    project: Project;
}

export async function createProject(
    organizationId: string,
    token: string,
    name: string,
    description?: string
): Promise<Project> {
    const response = await fetch(
        `${API_URL}/organizations/${organizationId}/projects`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                ...(description?.trim()
                    ? {
                          description: description.trim(),
                      }
                    : {}),
            }),
            cache: "no-store",
        }
    );

    const data =
        (await response.json()) as CreateProjectResponse;

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to create project"
        );
    }

    return data.project;
}

{/* Getting Tasks */}

export interface TasksResponse {
    status: string;
    tasks: Task[];
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    dueDate: string | null;
    assigneeId: string | null;
    createdAt: string;
    updatedAt: string;
}

export async function getTasks(
    projectId: string,
    token: string
): Promise<Task[]> {
    const response = await fetch(
        `${API_URL}/projects/${projectId}/tasks`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        }
    );

    const data =
        (await response.json()) as TasksResponse & {
            message?: string;
        };

    if (!response.ok) {
        throw new Error(
            data.message ||
                "Failed to load tasks"
        );
    }

    return data.tasks;
}