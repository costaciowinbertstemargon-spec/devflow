import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Notifications API", () => {
    it("should reject getting notifications without authentication", async () => {
        const response = await request(app)
        .get("/api/notifications");

        expect(response.status).toBe(401);
    });

    it("should get notifications for an authenticated user", async () => {
        const email = `notification-${Date.now()}@example.com`;
        const password = "password123";

        // Register user
        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Test User",
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

        // Get notifications
        const notificationsResponse = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${token}`);

        expect(notificationsResponse.status).toBe(200);
        expect(notificationsResponse.body.status).toBe("success");

        const notifications = notificationsResponse.body.notifications;

        expect(Array.isArray(notifications)).toBe(true);
    });

    it("should mark a notification as read", async () => {
        const ownerEmail = `notification-owner-${Date.now()}@example.com`;
        const assigneeEmail = `notification-assignee-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Owner",
            email: ownerEmail,
            password,
            });

        // Register assignee
        const assigneeRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Assignee",
            email: assigneeEmail,
            password,
            });

        expect(assigneeRegister.status).toBe(201);

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
        const assigneeId = assigneeRegister.body.user.id;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Notification Organization ${Date.now()}`,
            description: "Testing notifications",
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
            name: "Notification Project",
            description: "Testing notifications",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Notification Task",
            description: "Testing notification read status",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Assign task to assignee
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId,
            });

        expect(updateResponse.status).toBe(200);

        // Get assignee notifications
        const notificationsResponse = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(notificationsResponse.status).toBe(200);

        const notifications = notificationsResponse.body.notifications;

        expect(Array.isArray(notifications)).toBe(true);
        expect(notifications.length).toBeGreaterThan(0);

        const notification = notifications[0];

        expect(notification.isRead).toBe(false);

        // Mark notification as read
        const readResponse = await request(app)
            .patch(`/api/notifications/${notification.id}/read`)
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(readResponse.status).toBe(200);
        expect(readResponse.body.status).toBe("success");
    });

    it("should mark all notifications as read", async () => {
        const ownerEmail = `notification-all-owner-${Date.now()}@example.com`;
        const assigneeEmail = `notification-all-assignee-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification All Owner",
            email: ownerEmail,
            password,
            });

        // Register assignee
        const assigneeRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification All Assignee",
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
            name: `Notification All Organization ${Date.now()}`,
            description: "Testing mark all as read",
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
            name: "Notification All Project",
            description: "Testing mark all as read",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create first task
        const firstTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Notification Task One",
            priority: "MEDIUM",
            });

        expect(firstTaskResponse.status).toBe(201);

        // Assign first task
        const firstUpdateResponse = await request(app)
            .patch(`/api/tasks/${firstTaskResponse.body.task.id}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId,
            });

        expect(firstUpdateResponse.status).toBe(200);

        // Create second task
        const secondTaskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Notification Task Two",
            priority: "HIGH",
            });

        expect(secondTaskResponse.status).toBe(201);

        // Assign second task
        const secondUpdateResponse = await request(app)
            .patch(`/api/tasks/${secondTaskResponse.body.task.id}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId,
            });

        expect(secondUpdateResponse.status).toBe(200);

        // Get notifications
        const notificationsResponse = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(notificationsResponse.status).toBe(200);

        const notifications = notificationsResponse.body.notifications;

        expect(Array.isArray(notifications)).toBe(true);
        expect(notifications.length).toBeGreaterThanOrEqual(2);

        // Mark all as read
        const readAllResponse = await request(app)
            .patch("/api/notifications/read-all")
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(readAllResponse.status).toBe(200);
        expect(readAllResponse.body.status).toBe("success");

        // Verify notifications are read
        const updatedNotificationsResponse = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(updatedNotificationsResponse.status).toBe(200);

        const updatedNotifications =
            updatedNotificationsResponse.body.notifications;

        console.log("UPDATED NOTIFICATIONS:", updatedNotifications);

        expect(Array.isArray(updatedNotifications)).toBe(true);

        const unreadNotifications = updatedNotifications.filter(
        (notification: { isRead: boolean }) => !notification.isRead
        );

        console.log("UNREAD NOTIFICATIONS:", unreadNotifications);

        expect(unreadNotifications).toHaveLength(0);
    });

    it("should reject marking another user's notification as read", async () => {
        const ownerEmail = `notification-owner-${Date.now()}@example.com`;
        const assigneeEmail = `notification-assignee-${Date.now()}@example.com`;
        const attackerEmail = `notification-attacker-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Owner",
            email: ownerEmail,
            password,
            });

        // Register assignee
        const assigneeRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Assignee",
            email: assigneeEmail,
            password,
            });

        expect(assigneeRegister.status).toBe(201);

        const assigneeId = assigneeRegister.body.user.id;

        // Register attacker
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Attacker",
            email: attackerEmail,
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

        // Login assignee
        const assigneeLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: assigneeEmail,
            password,
            });

        expect(assigneeLogin.status).toBe(200);

        const assigneeToken = assigneeLogin.body.token;

        // Login attacker
        const attackerLogin = await request(app)
            .post("/api/auth/login")
            .send({
            email: attackerEmail,
            password,
            });

        expect(attackerLogin.status).toBe(200);

        const attackerToken = attackerLogin.body.token;

        // Create organization
        const organizationResponse = await request(app)
            .post("/api/organizations")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            name: `Notification Ownership Organization ${Date.now()}`,
            description: "Testing notification ownership",
            });

        expect(organizationResponse.status).toBe(201);

        const organizationId = organizationResponse.body.organization.id;

        // Add assignee
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
            name: "Notification Ownership Project",
            description: "Testing notification ownership",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Notification Ownership Task",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Assign task to assignee
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId,
            });

        expect(updateResponse.status).toBe(200);

        // Get assignee notifications
        const notificationsResponse = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(notificationsResponse.status).toBe(200);

        const notifications = notificationsResponse.body.notifications;

        expect(notifications.length).toBeGreaterThan(0);

        const notificationId = notifications[0].id;

        // Attacker attempts to mark assignee's notification as read
        const readResponse = await request(app)
            .patch(`/api/notifications/${notificationId}/read`)
            .set("Authorization", `Bearer ${attackerToken}`);

        expect(readResponse.status).toBe(404);
    });

    it("should only return notifications belonging to the authenticated user", async () => {
        const ownerEmail = `notification-isolation-owner-${Date.now()}@example.com`;
        const assigneeEmail = `notification-isolation-assignee-${Date.now()}@example.com`;
        const password = "password123";

        // Register owner
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Isolation Owner",
            email: ownerEmail,
            password,
            });

        // Register assignee
        const assigneeRegister = await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Isolation Assignee",
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
            name: `Notification Isolation Organization ${Date.now()}`,
            description: "Testing notification isolation",
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
            name: "Notification Isolation Project",
            description: "Testing notification isolation",
            });

        expect(projectResponse.status).toBe(201);

        const projectId = projectResponse.body.project.id;

        // Create task
        const taskResponse = await request(app)
            .post(`/api/projects/${projectId}/tasks`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            title: "Notification Isolation Task",
            priority: "MEDIUM",
            });

        expect(taskResponse.status).toBe(201);

        const taskId = taskResponse.body.task.id;

        // Assign task to assignee
        const updateResponse = await request(app)
            .patch(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
            assigneeId,
            });

        expect(updateResponse.status).toBe(200);

        // Get assignee notifications
        const assigneeNotifications = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${assigneeToken}`);

        expect(assigneeNotifications.status).toBe(200);

        const notifications = assigneeNotifications.body.notifications;

        expect(notifications.length).toBeGreaterThan(0);

        // Owner should not receive the assignee's notification
        const ownerNotifications = await request(app)
            .get("/api/notifications")
            .set("Authorization", `Bearer ${ownerToken}`);

        expect(ownerNotifications.status).toBe(200);

        const ownerNotificationIds = ownerNotifications.body.notifications.map(
            (notification: { id: string }) => notification.id
        );

        const assigneeNotificationIds = notifications.map(
            (notification: { id: string }) => notification.id
        );

        for (const notificationId of assigneeNotificationIds) {
            expect(ownerNotificationIds).not.toContain(notificationId);
        }
    });

    it("should return 404 when the notification does not exist", async () => {
        const email = `notification-not-found-${Date.now()}@example.com`;
        const password = "password123";

        // Register
        await request(app)
            .post("/api/auth/register")
            .send({
            name: "Notification Not Found User",
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

        const fakeNotificationId =
            "00000000-0000-0000-0000-000000000000";

        const response = await request(app)
            .patch(`/api/notifications/${fakeNotificationId}/read`)
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(404);
    });

    it("should reject marking all notifications as read without authentication", async () => {
        const response = await request(app)
            .patch("/api/notifications/read-all");

        expect(response.status).toBe(401);
    });
});