"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { useAuth } from "./AuthProvider";
import {
    getOrganizations,
    getOrganization,
    type Organization,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

interface OrganizationContextValue {
    organizations: Organization[];
    activeOrganization: Organization | null;
    activeOrganizationRole: "OWNER" | "ADMIN" | "MEMBER" | null;
    loading: boolean;
    setActiveOrganization: (
        organization: Organization
    ) => void;
    refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<
    OrganizationContextValue | undefined
>(undefined);

const ACTIVE_ORGANIZATION_KEY =
    "devflow_active_organization";

export function OrganizationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [organizations, setOrganizations] = useState<
        Organization[]
    >([]);

    const [activeOrganization, setActiveOrganizationState] =
        useState<Organization | null>(null);

    const [activeOrganizationRole, setActiveOrganizationRole] =
        useState<"OWNER" | "ADMIN" | "MEMBER" | null>(null);

    const [loading, setLoading] = useState(true);
    const {user, loading: authLoading } = useAuth();

    async function setActiveOrganization(
        organization: Organization
    ) {
        const token = getToken();

        setActiveOrganizationState(organization);

        localStorage.setItem(
            ACTIVE_ORGANIZATION_KEY,
            organization.id
        );

        if (!token || !user) {
            setActiveOrganizationRole(null);
            return;
        }

        try {
            const organizationDetails =
                await getOrganization(
                    organization.id,
                    token
                );

            const currentMember =
                organizationDetails.members.find(
                    (member) =>
                        member.userId === user.id
                );

            setActiveOrganizationRole(
                currentMember?.role ?? null
            );
        } catch (error) {
            console.error(
                "Failed to load organization role:",
                error
            );

            setActiveOrganizationRole(null);
        }
    }

    async function refreshOrganizations() {
        const token = getToken();

        if (!token) {
            setOrganizations([]);
            setActiveOrganizationState(null);
            setActiveOrganizationRole(null);
            return;
        }

        const result = await getOrganizations(token);

        setOrganizations(result);

        if (result.length === 0) {
            setActiveOrganizationState(null);
            setActiveOrganizationRole(null);

            localStorage.removeItem(
                ACTIVE_ORGANIZATION_KEY
            );

            return;
        }

        const savedOrganizationId =
            localStorage.getItem(
                ACTIVE_ORGANIZATION_KEY
            );

        const selectedOrganization =
            result.find(
                (organization) =>
                    organization.id === savedOrganizationId
            ) ?? result[0];

        setActiveOrganizationState(
            selectedOrganization
        );

        if (!user) {
            setActiveOrganizationRole(null);
            return;
        }

        const organizationDetails =
            await getOrganization(
                selectedOrganization.id,
                token
            );

        const currentMember =
            organizationDetails.members.find(
                (member) =>
                    member.userId === user.id
            );

        setActiveOrganizationRole(
            currentMember?.role ?? null
        );
    }

    useEffect(() => {
        if (authLoading) {
            return;
        }

        async function loadOrganizations() {
            try {
                await refreshOrganizations();
            } catch (error) {
                console.error(
                    "Failed to load organizations:",
                    error
                );

                setOrganizations([]);
                setActiveOrganizationState(null);
            } finally {
                setLoading(false);
            }
        }

        void loadOrganizations();
    }, [authLoading]);

    return (
        <OrganizationContext.Provider
            value={{
                organizations,
                activeOrganization,
                activeOrganizationRole,
                loading,
                setActiveOrganization,
                refreshOrganizations,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
}

export function useOrganization() {
    const context = useContext(
        OrganizationContext
    );

    if (!context) {
        throw new Error(
            "useOrganization must be used inside OrganizationProvider"
        );
    }

    return context;
}