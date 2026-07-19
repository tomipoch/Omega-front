import { describe, it, expect } from 'vitest';
import { LoginResponseSchema } from './auth';

describe('LoginResponseSchema', () => {
  it('parses a well-formed response with snake_case id', () => {
    const parsed = LoginResponseSchema.parse({
      usuario_id: 1,
      nombre: 'Test',
      token: 'abc.def.ghi',
      foto_perfil_url: '/uploads/x.jpg',
      rol_id: 2,
    });
    expect(parsed.usuario_id).toBe(1);
    expect(parsed.rol_id).toBe(2);
    expect(parsed.foto_perfil_url).toBe('/uploads/x.jpg');
  });

  it('accepts camelCase id (userId) and id fallback', () => {
    expect(
      LoginResponseSchema.parse({
        userId: 5,
        nombre: 'A',
        token: 't',
        rol_id: '1',
      }).usuario_id,
    ).toBe(5);
    expect(
      LoginResponseSchema.parse({
        id: 9,
        nombre: 'B',
        token: 't',
        rol_id: 1,
      }).usuario_id,
    ).toBe(9);
  });

  it('throws when no id field is present', () => {
    expect(() =>
      LoginResponseSchema.parse({
        nombre: 'X',
        token: 't',
        rol_id: 1,
      }),
    ).toThrow();
  });

  it('coerces rol_id from string to number', () => {
    const parsed = LoginResponseSchema.parse({
      usuario_id: 1,
      nombre: 'A',
      token: 't',
      rol_id: '2',
    });
    expect(parsed.rol_id).toBe(2);
  });
});