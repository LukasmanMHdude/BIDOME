export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			cmd_analytics: {
				Row: {
					command: string;
					times: number;
				};
				Insert: {
					command: string;
					times?: number;
				};
				Update: {
					command?: string;
					times?: number;
				};
				Relationships: [];
			};
			music_notifications: {
				Row: {
					author: string;
					length: number;
					name: string;
					requestedby: string;
					server_id: string;
					started: string;
					thumbnail: string;
				};
				Insert: {
					author: string;
					length: number;
					name: string;
					requestedby: string;
					server_id: string;
					started?: string;
					thumbnail: string;
				};
				Update: {
					author?: string;
					length?: number;
					name?: string;
					requestedby?: string;
					server_id?: string;
					started?: string;
					thumbnail?: string;
				};
				Relationships: [];
			};
			ranks: {
				Row: {
					achivements: string[] | null;
					id: number;
					server_id: string | null;
					user_id: string | null;
					xp: number | null;
				};
				Insert: {
					achivements?: string[] | null;
					id?: number;
					server_id?: string | null;
					user_id?: string | null;
					xp?: number | null;
				};
				Update: {
					achivements?: string[] | null;
					id?: number;
					server_id?: string | null;
					user_id?: string | null;
					xp?: number | null;
				};
				Relationships: [];
			};
			reminders: {
				Row: {
					channel_id: string;
					created_at: string;
					future_sends: string[];
					id: number;
					message_id: string;
					remind_at: string;
					reminder: string;
					server_id: string;
					user_id: string;
				};
				Insert: {
					channel_id: string;
					created_at?: string;
					future_sends: string[];
					id?: number;
					message_id: string;
					remind_at: string;
					reminder: string;
					server_id: string;
					user_id: string;
				};
				Update: {
					channel_id?: string;
					created_at?: string;
					future_sends?: string[];
					id?: number;
					message_id?: string;
					remind_at?: string;
					reminder?: string;
					server_id?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			servers: {
				Row: {
					config: Json | null;
					free_nitro_emotes: boolean;
					id: number;
					invited_at: string;
					prefix: string[];
					server_id: string;
					suggestion_accepted_channel: string | null;
					suggestion_channel: string | null;
					suggestion_denied_channel: string | null;
				};
				Insert: {
					config?: Json | null;
					free_nitro_emotes?: boolean;
					id?: number;
					invited_at?: string;
					prefix?: string[];
					server_id: string;
					suggestion_accepted_channel?: string | null;
					suggestion_channel?: string | null;
					suggestion_denied_channel?: string | null;
				};
				Update: {
					config?: Json | null;
					free_nitro_emotes?: boolean;
					id?: number;
					invited_at?: string;
					prefix?: string[];
					server_id?: string;
					suggestion_accepted_channel?: string | null;
					suggestion_channel?: string | null;
					suggestion_denied_channel?: string | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			[_ in never]: never;
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema["Tables"] & PublicSchema["Views"])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends
		{ schema: keyof Database } ? keyof (
			& Database[PublicTableNameOrOptions["schema"]]["Tables"]
			& Database[PublicTableNameOrOptions["schema"]]["Views"]
		)
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database } ? (
		& Database[PublicTableNameOrOptions["schema"]]["Tables"]
		& Database[PublicTableNameOrOptions["schema"]]["Views"]
	)[TableName] extends {
		Row: infer R;
	} ? R
	: never
	: PublicTableNameOrOptions extends keyof (
		& PublicSchema["Tables"]
		& PublicSchema["Views"]
	) ? (
			& PublicSchema["Tables"]
			& PublicSchema["Views"]
		)[PublicTableNameOrOptions] extends {
			Row: infer R;
		} ? R
		: never
	: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof PublicSchema["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends
		{ schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends
		{
			Insert: infer I;
		} ? I
	: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
			Insert: infer I;
		} ? I
		: never
	: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof PublicSchema["Tables"]
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends
		{ schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends
		{
			Update: infer U;
		} ? U
	: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
		? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
			Update: infer U;
		} ? U
		: never
	: never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof PublicSchema["Enums"]
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
		? PublicSchema["Enums"][PublicEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema["CompositeTypes"]
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	} ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]][
			"CompositeTypes"
		]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][
		CompositeTypeName
	]
	: PublicCompositeTypeNameOrOptions extends
		keyof PublicSchema["CompositeTypes"]
		? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;
