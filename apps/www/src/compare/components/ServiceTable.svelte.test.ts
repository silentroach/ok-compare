import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ServiceTable from './ServiceTable.svelte';
import type { ServiceModel } from '../lib/settlement/types';

describe('ServiceTable', () => {
  const mockServices: ServiceModel = {
    garbageCollection: 'yes',
    snowRemoval: 'partial',
    roadCleaning: 'yes',
    landscaping: 'yes',
    emergencyService: 'no',
  };

  const mockShelkovoServices: ServiceModel = {
    garbageCollection: 'yes',
    snowRemoval: 'yes',
    roadCleaning: 'yes',
    landscaping: 'yes',
    emergencyService: 'yes',
    dispatcher: 'yes',
  };

  it('displays correct labels for service items', () => {
    const { getByText } = render(ServiceTable, {
      props: {
        services: mockServices,
      },
    });

    // Проверяем, что русские подписи отображаются.
    expect(getByText('Вывоз мусора')).toBeTruthy();
    expect(getByText('Уборка снега')).toBeTruthy();
    expect(getByText('Уборка дорог')).toBeTruthy();
    expect(getByText('Благоустройство')).toBeTruthy();
    expect(getByText('Аварийная служба')).toBeTruthy();
    expect(getByText('Диспетчерская служба')).toBeTruthy();
  });

  it('shows comparison column when shelkovoServices is provided', () => {
    const { container, getByText } = render(ServiceTable, {
      props: {
        services: mockServices,
        shelkovoServices: mockShelkovoServices,
      },
    });

    // Должен быть заголовок колонки сравнения.
    expect(getByText('Шелково')).toBeTruthy();

    // Должна быть колонка сравнения.
    const comparisonCells = container.querySelectorAll(
      '[data-testid="shelkovo-service-status"]',
    );
    expect(comparisonCells.length).toBe(6);
  });

  it('does not show comparison column when shelkovoServices is not provided', () => {
    const { container, queryByText } = render(ServiceTable, {
      props: {
        services: mockServices,
      },
    });

    // Заголовка колонки сравнения быть не должно.
    expect(queryByText('Шелково')).toBeNull();

    // Ячеек сравнения быть не должно.
    const comparisonCells = container.querySelectorAll(
      '[data-testid="shelkovo-service-status"]',
    );
    expect(comparisonCells.length).toBe(0);
  });

  it('renders with empty/unknown services', () => {
    const emptyServices: ServiceModel = {};

    const { container, getAllByText } = render(ServiceTable, {
      props: {
        services: emptyServices,
      },
    });

    const rows = container.querySelectorAll('[data-testid="service-row"]');
    expect(rows.length).toBe(6);
    expect(getAllByText('Неизвестно').length).toBe(6);
  });

  it('shows only differing rows when diff toggle is enabled', async () => {
    const { container, getByTestId } = render(ServiceTable, {
      props: {
        title: 'Модель обслуживания',
        services: mockServices,
        shelkovoServices: mockShelkovoServices,
      },
    });

    const full = container.querySelectorAll(
      '[data-testid="service-row"]',
    ).length;
    expect(full).toBe(6);

    const btn = getByTestId('service-diff-toggle');
    await fireEvent.click(btn);

    const filtered = container.querySelectorAll(
      '[data-testid="service-row"]',
    ).length;
    expect(filtered).toBe(3);
    expect(btn.getAttribute('title')).toBe('Показать все свойства');
  });
});
