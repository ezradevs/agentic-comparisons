import { Request, Response } from 'express';
import { getDatabase } from '../database/connection';

export const getAllPlayers = (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { active } = req.query;

    let query = 'SELECT * FROM players';
    const params: any[] = [];

    if (active !== undefined) {
      query += ' WHERE active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    query += ' ORDER BY last_name, first_name';

    const players = db.prepare(query).all(...params);
    res.json({ players });
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPlayer = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.json({ player });
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createPlayer = (req: Request, res: Response) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      rating,
      fide_id,
      birth_date
    } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name required' });
    }

    const db = getDatabase();
    const result = db
      .prepare(
        `INSERT INTO players
        (first_name, last_name, email, phone, rating, fide_id, birth_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        first_name,
        last_name,
        email || null,
        phone || null,
        rating || 1200,
        fide_id || null,
        birth_date || null
      );

    const player = db
      .prepare('SELECT * FROM players WHERE id = ?')
      .get(result.lastInsertRowid);

    res.status(201).json({ player });
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePlayer = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      email,
      phone,
      rating,
      fide_id,
      birth_date,
      active
    } = req.body;

    const db = getDatabase();

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    db.prepare(
      `UPDATE players
      SET first_name = ?, last_name = ?, email = ?, phone = ?,
          rating = ?, fide_id = ?, birth_date = ?, active = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`
    ).run(
      first_name,
      last_name,
      email || null,
      phone || null,
      rating,
      fide_id || null,
      birth_date || null,
      active !== undefined ? active : 1,
      id
    );

    const updatedPlayer = db
      .prepare('SELECT * FROM players WHERE id = ?')
      .get(id);

    res.json({ player: updatedPlayer });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePlayer = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const player = db.prepare('SELECT * FROM players WHERE id = ?').get(id);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    // Soft delete
    db.prepare('UPDATE players SET active = 0 WHERE id = ?').run(id);

    res.json({ message: 'Player deactivated successfully' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
