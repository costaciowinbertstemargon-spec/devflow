"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    getOrganizations,
    type Organization,
} from "@/lib/api";
import { getToken } from "@/lib/auth";

interface OrganizationContextValue {
    organizations: Organization[];
    activeOrganization: Organization | null;
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

    const [loading, setLoading] = useState(true);

    function setActiveOrganization(
        organization: Organization
    ) {
        setActiveOrganizationState(organization);

        localStorage.setItem(
            ACTIVE_ORGANIZATION_KEY,
            organization.id
        );
    }

    async function refreshOrganizations() {
        const token = getToken();

        if (!token) {
            setOrganizations([]);
            setActiveOrganizationState(null);
            return;
        }

        const result = await getOrganizations(token);

        setOrganizations(result);

        if (result.length === 0) {
            setActiveOrganizationState(null);
            localStorage.removeItem(
                ACTIVE_ORGANIZATION_KEY
            );
            return;
        }

        const savedOrganizationId =
            localStorage.getItem(
                ACTIVE_ORGANIZATION_KEY
            );

        const savedOrganization = result.find(
            (organization) =>
                organization.id === savedOrganizationId
        );

        setActiveOrganizationState(
            savedOrganization ?? result[0]
        );
    }

    useEffect(() => {
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
    }, []);

    return (
        <OrganizationContext.Provider
            value={{
                organizations,
                activeOrganization,
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