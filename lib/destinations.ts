import db from "./db";
import type { Destination, JourneyMessage, Reaction, UserIdentity } from "./types";

type DestinationRow = {
  id: number; title: string; location: string; planned_date: string | null; status: Destination["status"];
  notes: string; created_at: string; updated_at: string;
  user_id: number; username: string; display_name: string;
};

type ReactionRow = { destination_id: number; emoji: string; user_id: number; display_name: string };
type MessageRow = { id: number; destination_id: number; body: string; created_at: string; user_id: number; username: string; display_name: string };

export function listDestinations(currentUserId: number): Destination[] {
  const rows = db.prepare(`
    SELECT d.*, u.id AS user_id, u.username, u.display_name
    FROM destinations d JOIN users u ON u.id = d.created_by
    ORDER BY CASE d.status WHEN 'planned' THEN 0 WHEN 'wishlist' THEN 1 ELSE 2 END, d.planned_date IS NULL, d.planned_date, d.updated_at DESC
  `).all() as DestinationRow[];
  const reactionRows = db.prepare(`
    SELECT r.destination_id, r.emoji, u.id AS user_id, u.display_name
    FROM reactions r JOIN users u ON u.id = r.user_id ORDER BY r.created_at
  `).all() as ReactionRow[];
  const messageRows = db.prepare(`
    SELECT m.id, m.destination_id, m.body, m.created_at, u.id AS user_id, u.username, u.display_name
    FROM messages m JOIN users u ON u.id = m.user_id ORDER BY m.created_at
  `).all() as MessageRow[];

  return rows.map((row) => {
    const grouped = new Map<string, Reaction>();
    for (const reaction of reactionRows.filter((item) => item.destination_id === row.id)) {
      const current = grouped.get(reaction.emoji) ?? { emoji: reaction.emoji, count: 0, users: [], reactedByMe: false };
      current.count += 1;
      current.users.push(reaction.display_name);
      if (reaction.user_id === currentUserId) current.reactedByMe = true;
      grouped.set(reaction.emoji, current);
    }
    const messages: JourneyMessage[] = messageRows.filter((item) => item.destination_id === row.id).map((item) => ({
      id: item.id,
      body: item.body,
      createdAt: item.created_at,
      user: { id: item.user_id, username: item.username, displayName: item.display_name },
    }));
    const createdBy: UserIdentity = { id: row.user_id, username: row.username, displayName: row.display_name };
    return {
      id: row.id, title: row.title, location: row.location, plannedDate: row.planned_date, status: row.status,
      notes: row.notes, createdAt: row.created_at, updatedAt: row.updated_at,
      createdBy, reactions: [...grouped.values()], messages,
    };
  });
}
