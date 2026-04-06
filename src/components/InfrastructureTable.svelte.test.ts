import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import InfrastructureTable from './InfrastructureTable.svelte';
import type { Infrastructure } from '../lib/schema';

describe('InfrastructureTable', () => {
  const mockInfra: Infrastructure = {
    roads: 'asphalt',
    sidewalks: 'partial',
    lighting: 'yes',
    gas: 'yes',
    water: 'yes',
    sewage: 'yes',
    checkpoints: 'yes',
    security: 'yes',
    fencing: 'no',
    video_surveillance: 'checkpoint_only',
    admin_building: 'yes',
    retail_or_services: 'partial',
  };

  const mockShelkovoInfra: Infrastructure = {
    roads: 'partial_asphalt',
    sidewalks: 'no',
    lighting: 'yes',
    gas: 'yes',
    water: 'yes',
    sewage: 'no',
    drainage: 'open',
    checkpoints: 'yes',
    security: 'yes',
    fencing: 'yes',
    video_surveillance: 'checkpoint_only',
    underground_electricity: 'partial',
    admin_building: 'no',
    retail_or_services: 'no',
  };

  it('displays correct labels for infrastructure items', () => {
    const { getByText } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
      },
    });

    // Check Russian labels are displayed
    expect(getByText('Дороги')).toBeTruthy();
    expect(getByText('Тротуары')).toBeTruthy();
    expect(getByText('Уличное освещение')).toBeTruthy();
    expect(getByText('Газ')).toBeTruthy();
    expect(getByText('Центральное водоснабжение')).toBeTruthy();
    expect(getByText('Центральная канализация')).toBeTruthy();
    expect(getByText('Охрана')).toBeTruthy();
  });

  it('shows comparison column when shelkovoInfra is provided', () => {
    const { container, getByText } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
        shelkovoInfra: mockShelkovoInfra,
      },
    });

    // Should have comparison column header
    expect(getByText('Шелково')).toBeTruthy();

    // Should have comparison column (14 with underground_electricity)
    const comparisonCells = container.querySelectorAll(
      '[data-testid="shelkovo-status"]',
    );
    expect(comparisonCells.length).toBe(14);
  });

  it('does not show comparison column when shelkovoInfra is not provided', () => {
    const { container, queryByText } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
      },
    });

    // Should not have comparison column header
    expect(queryByText('Шелково')).toBeNull();

    // Should not have comparison cells
    const comparisonCells = container.querySelectorAll(
      '[data-testid="shelkovo-status"]',
    );
    expect(comparisonCells.length).toBe(0);
  });

  it('renders with empty/unknown infrastructure', () => {
    const emptyInfra: Infrastructure = {};

    const { container } = render(InfrastructureTable, {
      props: {
        infra: emptyInfra,
      },
    });

    // Should still render all 14 rows even with empty data
    const rows = container.querySelectorAll('[data-testid="infra-row"]');
    expect(rows.length).toBe(14);
  });

  it('shows only differing rows when diff toggle is enabled', async () => {
    const { container, getByTestId } = render(InfrastructureTable, {
      props: {
        title: 'Инфраструктура',
        infra: mockInfra,
        shelkovoInfra: mockShelkovoInfra,
      },
    });

    const full = container.querySelectorAll('[data-testid="infra-row"]').length;
    expect(full).toBe(14);

    const btn = getByTestId('infra-diff-toggle');
    await fireEvent.click(btn);

    const filtered = container.querySelectorAll(
      '[data-testid="infra-row"]',
    ).length;
    expect(filtered).toBe(8);
    expect(btn.getAttribute('title')).toBe('Показать все свойства');
  });
});
