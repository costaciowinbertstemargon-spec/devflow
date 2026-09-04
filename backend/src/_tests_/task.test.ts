import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Tasks API", () => {
    it("should reject task creation without authentication", async () => {
        const fakeProjectId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
        .post(`/api/projects/${fakeProjectId}/tasks`)
        .send({
            title: "Test Task",
            description: "Testing task creation",
        });

        expect(response.status).toBe(401);
    });
    
    it("should create a task for an authenticated project member", async () => {
        const email = `task-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Test User",
            email,
            password,
            });

        expect(registerResponse.status).toBe(201);

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Test Organization ${Date.now()}`,
            description: "Testing task creation",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Test Project",
            description: "Testing task creation",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Test Task",
            description: "Testing task creation",
            priority: "HIGH",
            });

        expect(taskResponse.status).toBe(201);
        expect(taskResponse.body.status).toBe("success");
    });

    it("should reject task creation with invalid data", async () => {
        const email = `task-validation-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Validation User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Validation Organization ${Date.now()}`,
            description: "Testing task validation",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Validation Project",
            description: "Testing task validation",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Invalid task data
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "",
            priority: "INVALID_PRIORITY",
            });

        expect(taskResponse.status).toBe(400);
        expect(taskResponse.body.status).toBe("error");
        expect(taskResponse.body.message).toBe("Validation failed");
    });

    it("should update an existing task", async () => {
        const email = `task-update-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Update User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Update Organization ${Date.now()}`,
            description: "Testing task updates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Update Project",
            description: "Testing task updates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Original Task Title",
            description: "Original description",
            priority: "LOW",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Updated Task Title",
            description: "Updated description",
            status: "IN_PROGRESS",
            priority: "HIGH",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
    });

    it("should record activities when a task is updated", async () => {
        const email = `activity-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Activity Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Activity Organization ${Date.now()}`,
            description: "Testing activities",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Activity Test Project",
            description: "Testing activities",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Activity Test Task",
            description: "Original description",
            priority: "LOW",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Updated Activity Task",
            status: "IN_PROGRESS",
            priority: "HIGH",
            });

        expect(updateResponse.status).toBe(200);

        // Get activities
        const activitiesResponse = await request(app)
            .get(`/api/tasks/${taskId}/activities`)
            .set("Authorization", `Bearer ${token}`);

        expect(activitiesResponse.status).toBe(200);
        expect(activitiesResponse.body.status).toBe("success");

        const activities = activitiesResponse.body.activities;

        expect(Array.isArray(activities)).toBe(true);
        expect(activities.length).toBeGreaterThan(0);

        const actions = activities.map(
            (activity: { action: string }) => activity.action
        );

        expect(actions).toContain("TASK_UPDATED");
        expect(actions).toContain("STATUS_CHANGED");
        expect(actions).toContain("PRIORITY_CHANGED");
    });

    it("should reject activity access from a user outside the organization", async () => {
        const ownerEmail = `activity-owner-${Date.now()}@example.com`;
        const outsiderEmail = `activity-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Activity Owner",
            email: ownerEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Activity Security Organization ${Date.now()}`,
            description: "Testing activity security",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Activity Security Project",
            description: "Testing activity security",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Protected Activity Task",
            description: "Testing activity access",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Activity Outsider",
            email: outsiderEmail,
            password,
            });

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Try to access protected task activities
        const activitiesResponse = await request(app)
            .get(`/api/tasks/${taskId}/activities`)
            .set("Authorization", `Bearer ${outsiderToken}`);

        expect(activitiesResponse.status).toBe(403);
    });

    it("should reject task updates from a user outside the organization", async () => {
        const ownerEmail = `task-owner-${Date.now()}@example.com`;
        const outsiderEmail = `task-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Owner",
            email: ownerEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Task Security Organization ${Date.now()}`,
            description: "Testing task authorization",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Task Security Project",
            description: "Testing task authorization",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Protected Task",
            description: "This task should not be editable by outsiders",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Outsider",
            email: outsiderEmail,
            password,
            });

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Outsider attempts to update the task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${outsiderToken}`)
            .send({
            title: "Unauthorized Update",
            status: "DONE",
            });

        expect(updateResponse.status).toBe(403);
    });

    it("should create a notification when a task is assigned", async () => {
        const ownerEmail = `assign-owner-${Date.now()}@example.com`;
        const assigneeEmail = `assign-user-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignment Owner",
            email: ownerEmail,
            password,
            });

        // Register assignee
        const assigneeRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignment User",
            email: assigneeEmail,
            password,
            });

        expect(assigneeRegister.status).toBe(201);

        const assigneeId = assigneeRegister.body.user.id;

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Login assignee
        const assigneeLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: assigneeEmail,
            password,
            });

        expect(assigneeLogin.status).toBe(200);

        const assigneeToken = assigneeLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Assignment Organization ${Date.now()}`,
            description: "Testing task assignment notifications",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Add assignee to organization
        const memberResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            email: assigneeEmail,
            role: "MEMBER",
            });

        expect(memberResponse.status).toBe(201);

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Assignment Project",
            description: "Testing task assignment notifications",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Assignment Test Task",
            description: "Testing task assignment notification",
            priority: "HIGH",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Assign task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId,
            });

        expect(updateResponse.status).toBe(200);

        // Check assignee notifications
        const notificationsResponse = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(notificationsResponse.status).toBe(200);

        const notifications = notificationsResponse.body.notifications;

        expect(notifications.length).toBeGreaterThan(0);

        const assignmentNotification = notifications.find(
            (notification: { type: string; taskId?: string }) =>
            notification.type === "TASK_ASSIGNED" &&
            notification.taskId === taskId
        );

        expect(assignmentNotification).toBeDefined();
        expect(assignmentNotification.isRead).toBe(false);
    });

    it("should reject assigning a task to a user outside the organization", async () => {
        const ownerEmail = `assign-owner-${Date.now()}@example.com`;
        const outsiderEmail = `assign-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignment Owner",
            email: ownerEmail,
            password,
            });

        // Register outsider
        const outsiderRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignment Outsider",
            email: outsiderEmail,
            password,
            });

        expect(outsiderRegister.status).toBe(201);

        const outsiderId = outsiderRegister.body.user.id;

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Assignment Security Organization ${Date.now()}`,
            description: "Testing assignment authorization",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Assignment Security Project",
            description: "Testing assignment authorization",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Assignment Security Task",
            description: "Testing invalid task assignment",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Try to assign task to non-member
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId: outsiderId,
            });

        expect(updateResponse.status).toBe(403);
    });

    it("should unassign an existing task", async () => {
        const email = `unassign-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Unassign Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Unassign Organization ${Date.now()}`,
            description: "Testing task unassignment",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Unassign Project",
            description: "Testing task unassignment",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task assigned to the current user
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Unassign Test Task",
            description: "Testing task unassignment",
            priority: "MEDIUM",
            assigneeId: loginResponse.body.user.id,
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Unassign task
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            assigneeId: null,
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.assigneeId).toBeNull();
    });

    it("should update only the task status", async () => {
        const email = `status-only-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Status Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;
        const userId = loginResponse.body.user.id;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Status Organization ${Date.now()}`,
            description: "Testing status updates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Status Project",
            description: "Testing status updates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Status Test Task",
            description: "Status update test",
            priority: "LOW",
            assigneeId: userId,
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update only status
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            status: "DONE",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.status).toBe("DONE");
        expect(updateResponse.body.task.title).toBe("Status Test Task");
        expect(updateResponse.body.task.priority).toBe("LOW");
    });

    it("should update only the task priority", async () => {
        const email = `priority-only-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Priority Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Priority Organization ${Date.now()}`,
            description: "Testing priority updates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Priority Project",
            description: "Testing priority updates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Priority Test Task",
            description: "Priority update test",
            priority: "LOW",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update only priority
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            priority: "URGENT",
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.priority).toBe("URGENT");
        expect(updateResponse.body.task.title).toBe("Priority Test Task");
        expect(updateResponse.body.task.description).toBe("Priority update test");
    });

    it("should update only the task due date", async () => {
        const email = `duedate-only-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Due Date Test User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Due Date Organization ${Date.now()}`,
            description: "Testing due date updates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Due Date Project",
            description: "Testing due date updates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Due Date Test Task",
            description: "Due date update test",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Update only due date
        const dueDate = "2026-12-31T23:59:59.000Z";

        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            dueDate,
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.title).toBe("Due Date Test Task");
        expect(updateResponse.body.task.description).toBe("Due date update test");
        expect(updateResponse.body.task.priority).toBe("MEDIUM");

        expect(
            new Date(updateResponse.body.task.dueDate).toISOString()
        ).toBe(dueDate);
    });

    it("should clear the task due date", async () => {
        const email = `clear-due-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Clear Due Date User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Clear Due Date Organization ${Date.now()}`,
            description: "Testing due date clearing",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Clear Due Date Project",
            description: "Testing due date clearing",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task with due date
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Clear Due Date Task",
            description: "Testing due date clearing",
            priority: "MEDIUM",
            dueDate: "2026-12-31T23:59:59.000Z",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Clear due date
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            dueDate: null,
            });

        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body.status).toBe("success");
        expect(updateResponse.body.task.dueDate).toBeNull();
    });

    it("should reject an invalid task due date", async () => {
        const email = `invalid-due-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Invalid Due Date User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Invalid Due Date Organization ${Date.now()}`,
            description: "Testing invalid due dates",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Invalid Due Date Project",
            description: "Testing invalid due dates",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Try creating task with invalid due date
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Invalid Due Date Task",
            priority: "MEDIUM",
            dueDate: "not-a-valid-date",
            });

        expect(taskResponse.status).toBe(400);
        expect(taskResponse.body.status).toBe("error");
        expect(taskResponse.body.message).toBe("Validation failed");
    });

    it("should get a task for an authenticated project member", async () => {
        const email = `task-get-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Get User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Get Organization ${Date.now()}`,
            description: "Testing task retrieval",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Get Project",
            description: "Testing task retrieval",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Task Retrieval Test",
            description: "Testing task retrieval",
            priority: "HIGH",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Get task
        const getResponse = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(getResponse.status).toBe(200);
        expect(getResponse.body.status).toBe("success");
        expect(getResponse.body.task.id).toBe(taskId);
        expect(getResponse.body.task.title).toBe("Task Retrieval Test");
        expect(getResponse.body.task.priority).toBe("HIGH");
    });

    it("should get all tasks for a project", async () => {
        const email = `task-list-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task List User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task List Organization ${Date.now()}`,
            description: "Testing task retrieval",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task List Project",
            description: "Testing task retrieval",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create first task
        const firstTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Task One",
            description: "First test task",
            priority: "LOW",
            });

        expect(firstTaskResponse.status).toBe(201);

        // Create second task
        const secondTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Task Two",
            description: "Second test task",
            priority: "HIGH",
            });

        expect(secondTaskResponse.status).toBe(201);

        // Get project tasks
        const tasksResponse = await request(app)
            .get(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`);

        expect(tasksResponse.status).toBe(200);
        expect(tasksResponse.body.status).toBe("success");

        const tasks = tasksResponse.body.tasks;

        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks.length).toBeGreaterThanOrEqual(2);

        const taskTitles = tasks.map(
            (task: { title: string }) => task.title
        );

        expect(taskTitles).toContain("Task One");
        expect(taskTitles).toContain("Task Two");
    });

    it("should filter project tasks by status", async () => {
        const email = `task-status-filter-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Status Filter User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Status Filter Organization ${Date.now()}`,
            description: "Testing task status filtering",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Status Filter Project",
            description: "Testing task status filtering",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create TODO task
        const todoTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Todo Task",
            priority: "LOW",
            });

        expect(todoTaskResponse.status).toBe(201);

        // Create IN_PROGRESS task
        const inProgressTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "In Progress Task",
            priority: "HIGH",
            });

        expect(inProgressTaskResponse.status).toBe(201);

        const inProgressTaskId = inProgressTaskResponse.body.task.id;

        // Change second task's status
        const updateResponse = await request(app)
            .patch(`/api/tasks/${inProgressTaskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            status: "IN_PROGRESS",
            });

        expect(updateResponse.status).toBe(200);

        // Filter by IN_PROGRESS
        const filteredResponse = await request(app)
            .get(`/api/projects/${projectId}/tasks`)
            .query({
            status: "IN_PROGRESS",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(filteredResponse.status).toBe(200);
        expect(filteredResponse.body.status).toBe("success");

        const tasks = filteredResponse.body.tasks;

        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks.length).toBeGreaterThan(0);

        for (const task of tasks) {
            expect(task.status).toBe("IN_PROGRESS");
        }

        const taskTitles = tasks.map(
            (task: { title: string }) => task.title
        );

        expect(taskTitles).toContain("In Progress Task");
        expect(taskTitles).not.toContain("Todo Task");
    });

    it("should filter project tasks by priority", async () => {
        const email = `task-priority-filter-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Priority Filter User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Task Priority Filter Organization ${Date.now()}`,
            description: "Testing task priority filtering",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Task Priority Filter Project",
            description: "Testing task priority filtering",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create LOW priority task
        const lowTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "Low Priority Task",
            priority: "LOW",
            });

        expect(lowTaskResponse.status).toBe(201);

        // Create HIGH priority task
        const highTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            title: "High Priority Task",
            priority: "HIGH",
            });

        expect(highTaskResponse.status).toBe(201);

        // Filter by HIGH priority
        const filteredResponse = await request(app)
            .get(`/api/projects/${projectId}/tasks`)
            .query({
            priority: "HIGH",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(filteredResponse.status).toBe(200);
        expect(filteredResponse.body.status).toBe("success");

        const tasks = filteredResponse.body.tasks;

        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks.length).toBeGreaterThan(0);

        for (const task of tasks) {
            expect(task.priority).toBe("HIGH");
        }

        const taskTitles = tasks.map(
            (task: { title: string }) => task.title
        );

        expect(taskTitles).toContain("High Priority Task");
        expect(taskTitles).not.toContain("Low Priority Task");
    });

    it("should filter project tasks by assignee", async () => {
        const ownerEmail = `task-assignee-filter-owner-${Date.now()}@example.com`;
        const assigneeEmail = `task-assignee-filter-user-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignee Filter Owner",
            email: ownerEmail,
            password,
            });

        // Register assignee
        const assigneeRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Assignee Filter User",
            email: assigneeEmail,
            password,
            });

        expect(assigneeRegister.status).toBe(201);

        const assigneeId = assigneeRegister.body.user.id;

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Assignee Filter Organization ${Date.now()}`,
            description: "Testing assignee filtering",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Add assignee to organization
        const memberResponse = await request(app)
            .post(`/api/organizations/${organizationId}/members`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            email: assigneeEmail,
            role: "MEMBER",
            });

        expect(memberResponse.status).toBe(201);

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Assignee Filter Project",
            description: "Testing assignee filtering",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create assigned task
        const assignedTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Assigned Task",
            priority: "HIGH",
            assigneeId,
            });

        expect(assignedTaskResponse.status).toBe(201);

        // Create unassigned task
        const unassignedTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Unassigned Task",
            priority: "LOW",
            });

        expect(unassignedTaskResponse.status).toBe(201);

        // Filter by assignee
        const filteredResponse = await request(app)
            .get(`/api/projects/${projectId}/tasks`)
            .query({
            assigneeId,
            })
            .set("Authorization", `Bearer ${ownerToken}`);

        expect(filteredResponse.status).toBe(200);
        expect(filteredResponse.body.status).toBe("success");

        const tasks = filteredResponse.body.tasks;

        expect(Array.isArray(tasks)).toBe(true);
        expect(tasks.length).toBeGreaterThan(0);

        for (const task of tasks) {
            expect(task.assigneeId).toBe(assigneeId);
        }

        const taskTitles = tasks.map(
            (task: { title: string }) => task.title
        );

        expect(taskTitles).toContain("Assigned Task");
        expect(taskTitles).not.toContain("Unassigned Task");
    });

    it("should return 404 when the task does not exist", async () => {
        const email = `task-not-found-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task Not Found User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        const fakeTaskId = "00000000-0000-0000-0000-000000000000";

        // Get non-existent task
        const response = await request(app)
            .get(`/api/tasks/${fakeTaskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
    });

    it("should reject task list access from a user outside the organization", async () => {
        const ownerEmail = `task-list-owner-${Date.now()}@example.com`;
        const outsiderEmail = `task-list-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task List Owner",
            email: ownerEmail,
            password,
            });

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Task List Outsider",
            email: outsiderEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Task List Security Organization ${Date.now()}`,
            description: "Testing task list authorization",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Protected Task List Project",
            description: "Testing task list authorization",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Protected Task",
            priority: "HIGH",
            });

        expect(taskResponse.status).toBe(201);

        // Outsider tries to retrieve project tasks
        const tasksResponse = await request(app)
            .get(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${outsiderToken}`);

        expect(tasksResponse.status).toBe(403);
    });

    it("should reject an invalid task status filter", async () => {
        const email = `task-invalid-filter-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Invalid Filter User",
            email,
            password,
            });

        // Login
        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Invalid Filter Organization ${Date.now()}`,
            description: "Testing invalid filters",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Invalid Filter Project",
            description: "Testing invalid filters",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Send invalid status filter
        const response = await request(app)
            .get(`/api/projects/${projectId}/tasks`)
            .query({
            status: "INVALID_STATUS",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
    });

    it("should reject an invalid task priority filter", async () => {
        const email = `invalid-priority-filter-${Date.now()}@example.com`;
        const password = "password123";

        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Invalid Priority Filter User",
            email,
            password,
            });

        const loginResponse = await request(app)
            .post("/api/auth/login")
            .send({
            email,
            password,
            });

        expect(loginResponse.status).toBe(200);

        const token = loginResponse.body.token;

        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: `Invalid Priority Filter Organization ${Date.now()}`,
            description: "Testing invalid priority filters",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${token}`)
            .send({
            name: "Invalid Priority Filter Project",
            description: "Testing invalid priority filters",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        const response = await request(app)
            .get(`/api/projects/${projectId}/tasks`)
            .query({
            priority: "INVALID_PRIORITY",
            })
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
    });

    it("should reject getting a task without authentication", async () => {
        const fakeTaskId = "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .get(`/api/tasks/${fakeTaskId}`);

        expect(response.status).toBe(401);
    });

    it("should reject getting a task from a user outside the organization", async () => {
        const ownerEmail = `get-task-owner-${Date.now()}@example.com`;
        const outsiderEmail = `get-task-outsider-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Get Task Owner",
            email: ownerEmail,
            password,
            });

        // Register outsider
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Get Task Outsider",
            email: outsiderEmail,
            password,
            });

        // Login owner
        const ownerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: ownerEmail,
            password,
            });

        expect(ownerLogin.status).toBe(200);

        const ownerToken = ownerLogin.body.token;

        // Login outsider
        const outsiderLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: outsiderEmail,
            password,
            });

        expect(outsiderLogin.status).toBe(200);

        const outsiderToken = outsiderLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Get Task Security Organization ${Date.now()}`,
            description: "Testing task access",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Create project
        const projectResponse = await request(app)
            .post(`/api/organizations/${organizationId}/projects`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: "Get Task Security Project",
            description: "Testing task access",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Protected Get Task",
            priority: "HIGH",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Outsider tries to get the task
        const getResponse = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${outsiderToken}`);

        expect(getResponse.status).toBe(403);
    });
});