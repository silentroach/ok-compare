import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import ServiceTable from './ServiceTable.svelte';
import type { ServiceModel } from '../lib/schema';

describe('ServiceTable', () => {
  const mockServices: ServiceModel = {
    garbage_collection: 'yes',
    snow_removal: 'partial',
    road_cleaning: 'yes',
    landscaping: 'yes',
    emergency_service: 'no'
  };

  const mockShelkovoServices: ServiceModel = {
    garbage_collection: 'yes',
    snow_removal: 'yes',
    road_cleaning: 'yes',
    landscaping: 'yes',
    emergency_service: 'yes',
    dispatcher: 'yes'
  };

  it('displays correct labels for service items', () => {
    const { getByText } = render(ServiceTable, {
      props: {
        services: mockServices
      }
    });

    // Check Russian labels are displayed
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
        shelkovoServices: mockShelkovoServices
      }
    });

    // Should have comparison column header
    expect(getByText('Шелково')).toBeTruthy();

    // Should have comparison column
    const comparisonCells = container.querySelectorAll('[data-testid="shelkovo-service-status"]');
    expect(comparisonCells.length).toBe(6);
  });

  it('does not show comparison column when shelkovoServices is not provided', () => {
    const { container, queryByText } = render(ServiceTable, {
      props: {
        services: mockServices
      }
    });

    // Should not have comparison column header
    expect(queryByText('Шелково')).toBeNull();

    // Should not have comparison cells
    const comparisonCells = container.querySelectorAll('[data-testid="shelkovo-service-status"]');
    expect(comparisonCells.length).toBe(0);
  });

  it('highlights differences between settlement and Shelkovo', () => {
    const { container } = render(ServiceTable, {
      props: {
        services: mockServices,
        shelkovoServices: mockShelkovoServices
      }
    });

    // Find rows where there's a difference (snow_removal: partial vs yes, emergency_service: no vs yes, dispatcher: missing vs yes)
    const diffIndicators = container.querySelectorAll('[data-testid="diff-indicator"]');
    
    // There should be some differences highlighted
    expect(diffIndicators.length).toBeGreaterThan(0);
  });

  it('renders with empty/unknown services', () => {
    const emptyServices: ServiceModel = {};

    const { container, getAllByText } = render(ServiceTable, {
      props: {
        services: emptyServices
      }
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
        shelkovoServices: mockShelkovoServices
      }
    });

    const full = container.querySelectorAll('[data-testid="service-row"]').length;
    expect(full).toBe(6);

    const btn = getByTestId('service-diff-toggle');
    await fireEvent.click(btn);

    const filtered = container.querySelectorAll('[data-testid="service-row"]').length;
    const marks = container.querySelectorAll('[data-testid="diff-indicator"]').length;
    expect(filtered).toBe(3);
    expect(marks).toBe(3);
    expect(btn.getAttribute('title')).toBe('Показать все свойства');
  });
});
