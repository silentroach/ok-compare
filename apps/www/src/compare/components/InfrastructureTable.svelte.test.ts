import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import InfrastructureTable from './InfrastructureTable.svelte';
import type { Infrastructure } from '../lib/settlement/types';

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
    videoSurveillance: 'checkpointOnly',
    adminBuilding: 'yes',
    retailOrServices: 'partial',
  };

  const mockShelkovoInfra: Infrastructure = {
    roads: 'partlyAsphalt',
    sidewalks: 'no',
    lighting: 'yes',
    gas: 'yes',
    water: 'yes',
    sewage: 'no',
    drainage: 'open',
    checkpoints: 'yes',
    security: 'yes',
    fencing: 'yes',
    videoSurveillance: 'checkpointOnly',
    undergroundElectricity: 'partial',
    adminBuilding: 'no',
    retailOrServices: 'no',
  };

  it('displays correct labels for infrastructure items', () => {
    const { getByText } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
      },
    });

    // Проверяем, что русские подписи отображаются.
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

    // Должен быть заголовок колонки сравнения.
    expect(getByText('Шелково')).toBeTruthy();

    // Должна быть колонка сравнения: 14 строк вместе с undergroundElectricity.
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

    // Заголовка колонки сравнения быть не должно.
    expect(queryByText('Шелково')).toBeNull();

    // Ячеек сравнения быть не должно.
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

    // Даже с пустыми данными должны рендериться все 14 строк.
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
