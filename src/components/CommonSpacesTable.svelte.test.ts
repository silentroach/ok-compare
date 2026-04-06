import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import CommonSpacesTable from './CommonSpacesTable.svelte';
import type { CommonSpaces } from '../lib/schema';

describe('CommonSpacesTable', () => {
  const mockSpaces: CommonSpaces = {
    club_infrastructure: 'yes',
    playgrounds: 'yes',
    sports: 'yes',
    pool: 'no',
    fitness_club: 'no',
    restaurant: 'no',
    spa_center: 'no',
    walking_routes: 'no',
    water_access: 'yes',
    beach_zones: 'no',
    kids_club: 'no',
    sports_camp: 'no',
    primary_school: 'no',
    bbq_zones: 'no',
  };

  const mockShelkovoSpaces: CommonSpaces = {
    club_infrastructure: 'yes',
    playgrounds: 'yes',
    sports: 'yes',
    pool: 'no',
    fitness_club: 'no',
    restaurant: 'no',
    spa_center: 'no',
    walking_routes: 'no',
    water_access: 'yes',
    beach_zones: 'no',
    kids_club: 'no',
    sports_camp: 'no',
    primary_school: 'no',
    bbq_zones: 'no',
  };

  it('displays correct labels for common spaces', () => {
    const { getByText } = render(CommonSpacesTable, {
      props: {
        spaces: mockSpaces,
      },
    });

    expect(getByText('Клубная инфраструктура')).toBeTruthy();
    expect(getByText('Детские площадки')).toBeTruthy();
    expect(getByText('Спортивные площадки')).toBeTruthy();
    expect(getByText('Выход к воде')).toBeTruthy();
    expect(getByText('Пляжные зоны')).toBeTruthy();
  });

  it('shows comparison column when shelkovoSpaces is provided', () => {
    const { container, getByText } = render(CommonSpacesTable, {
      props: {
        spaces: mockSpaces,
        shelkovoSpaces: mockShelkovoSpaces,
      },
    });

    expect(getByText('Шелково')).toBeTruthy();

    const comparisonCells = container.querySelectorAll(
      '[data-testid="shelkovo-space-status"]',
    );
    expect(comparisonCells.length).toBe(14);
  });

  it('renders with empty/unknown common spaces', () => {
    const empty: CommonSpaces = {};

    const { container } = render(CommonSpacesTable, {
      props: {
        spaces: empty,
      },
    });

    const rows = container.querySelectorAll('[data-testid="space-row"]');
    expect(rows.length).toBe(14);
  });

  it('shows only differing rows when diff toggle is enabled', async () => {
    const { container, getByTestId } = render(CommonSpacesTable, {
      props: {
        title: 'Общие пространства',
        spaces: mockSpaces,
        shelkovoSpaces: mockShelkovoSpaces,
      },
    });

    const full = container.querySelectorAll('[data-testid="space-row"]').length;
    const diff = container.querySelectorAll(
      '[data-testid="diff-indicator"]',
    ).length;
    expect(full).toBe(14);

    const btn = getByTestId('spaces-diff-toggle');
    await fireEvent.click(btn);

    const filtered = container.querySelectorAll(
      '[data-testid="space-row"]',
    ).length;
    const marks = container.querySelectorAll(
      '[data-testid="diff-indicator"]',
    ).length;
    expect(filtered).toBe(diff);
    expect(marks).toBe(diff);
    expect(btn.getAttribute('title')).toBe('Показать все свойства');
  });

  it('shows club infrastructure as first row', () => {
    const { container } = render(CommonSpacesTable, {
      props: {
        spaces: mockSpaces,
      },
    });

    const first = container.querySelector('[data-testid="space-row"] td');
    expect(first?.textContent).toContain('Клубная инфраструктура');
  });
});
