import { supabase } from "@/lib/supabase";
import { create } from "zustand";

interface AppStatusState {
    maintenance: boolean;
    maintenanceMessage: string | null;
    accountDeletionRequested: boolean;
    deletionMessage: string | null;
    loading: boolean;

    checkAppStatus: (userId?: string) => Promise<void>;
    deleteAccount: (userId?: string) => Promise<void>;
    
    
}

interface Maintenance {
    id: number
    maintenance: boolean
    message: string
    update_at:string
}

export const useAppStatusStore = create<AppStatusState>((set) => ({
    maintenance: false,
    maintenanceMessage: null,
    accountDeletionRequested: false,
    deletionMessage: null,
    loading: true,

    checkAppStatus: async (userId?: string) => {
        try {
            //Maintenance

            const { data: maintenanceData, error } = await supabase
                .from('app_status')
                .select('*')
                .single<Maintenance>();

            if (maintenanceData?.maintenance) {
                set({
                    maintenance: true,
                    maintenanceMessage: maintenanceData.message,
                    loading: false,
                });
                return;
            }
   

            //Account deletion requested
            if (userId) {
                const { data: account_deletion_requests } = await supabase
                    .from("account_deletion_requests")
                    .select("requested, requested_at, message")
                    .eq("user_id ", userId)
                    .single();

                if (account_deletion_requests?.requested) {
                    set({
                        accountDeletionRequested: true,
                        deletionMessage:
                            `${account_deletion_requests.message ??
                            "Tu solicitud de eliminación está en proceso" }. Solicitado el ${new Date(account_deletion_requests.requested_at).toLocaleDateString()}`,
                        loading: false,
                    });
                    return;
                }
            }

            set({
                maintenance: false,
                maintenanceMessage: null,
                accountDeletionRequested: false,
                deletionMessage: null,
                loading: false,
            });

        } catch (e) {
            console.log("Error checking app status:", e);
            set({ loading: false });
        }
    },
    deleteAccount: async (userId?: string) => { {
        if (!userId) return;
        try {
            set({ loading: true });
            const { error } = await supabase
                .from("account_deletion_requests")
                .upsert({
                    user_id: userId,
                    requested: true,
                    requested_at: new Date().toISOString(),
                    message: "Solicitud iniciada por el usuario",
                });

            if (error) throw error;

            set({
                accountDeletionRequested: true,
                deletionMessage:
                    "Tu cuenta entró en proceso de eliminación.",
                loading: false,
            });
        } catch (e) {
            console.log("Error requesting account deletion:", e);
            set({ loading: false });
        }
    } 
   

    },
}));
