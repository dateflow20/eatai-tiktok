
import { supabase } from './supabaseClient';
import { UserSettings, Conversation, SocialReview } from '../types';

export const dataService = {
    async saveProfile(userId: string, settings: UserSettings) {
        // First, try to get the existing profile to see if we should update or insert
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();

        const profileData = {
            user_id: userId,
            user_name: settings.userName,
            agent_name: settings.agentName,
            user_gender: settings.userGender,
            target_gender: settings.targetGender,
            relationship: settings.relationship,
            current_vibe: settings.currentVibe,
            situation: settings.situation,
            goal: settings.goal,
            confidence: settings.confidence,
            humor: settings.humor,
            humanity: settings.humanity,
            is_profile_setup: settings.isProfileSetup,
            updated_at: new Date().toISOString()
        };

        if (existingProfile) {
            // Update
            const { error } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('user_id', userId);
            if (error) throw error;
        } else {
            // Insert
            const { error } = await supabase
                .from('profiles')
                .insert([profileData]);
            if (error) throw error;
        }
    },

    async getProfile(userId: string) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
    },

    async saveConversation(userId: string, conversation: Conversation) {
        const { data, error } = await supabase
            .from('conversations')
            .insert({
                user_id: userId,
                timestamp: conversation.timestamp,
                settings: conversation.settings,
                context: conversation.context,
                suggestions: conversation.suggestions,
                review: conversation.review,
                summary: conversation.summary
            });

        if (error) throw error;
        return data;
    },

    async getHistory(userId: string) {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .order('timestamp', { ascending: false });

        if (error) throw error;
        return data as any[];
    },

    async deleteConversation(userId: string, id: string) {
        const { error } = await supabase
            .from('conversations')
            .delete()
            .eq('user_id', userId)
            .eq('id', id);

        if (error) throw error;
    }
};
