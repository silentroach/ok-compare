import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import ServiceTable from './ServiceTable.svelte';
import type { ServiceModel } from '../lib/schema';

describe('ServiceTable', () => {
  const mockServices: ServiceModel = {
    garbage_collection: 'yes',
    snow_removal: 'partial',
    road_cleaning: 'yes',
    landscaping: 'yes',
    emergency_service: 'no',
    dispatcher: undefined
  };

  const mockShelkovoServices: ServiceModel = {
    garbage_collection: 'yes',
    snow_removal: 'yes',
    road_cleaning: 'yes',
    landscaping: 'yes',
    emergency_service: 'yes',
    dispatcher: 'yes'
  };

  it('renders all 6 service items', () => {
    const { container } = render(ServiceTable, {
      props: {
        services: mockServices,
        shelkovoServices: null
      }
    });

    // Check that all service items are displayed
    const rows = container.querySelectorAll('[data-testid="service-row"]');
    expect(rows.length).toBe(6);
  });

  it('displays correct labels for service items', () => {
    const { getByText } = render(ServiceTable, {
      props: {
        services: mockServices,
        shelkovoServices: null
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

  it('renders correct status icons and colors for yes/no/partial/unknown', () => {
    const { container } = render(ServiceTable, {
      props: {
        services: mockServices,
        shelkovoServices: null
      }
    });

    // Check that all items have status indicators
    const statusIcons = container.querySelectorAll('[data-testid="service-status"]');
    expect(statusIcons.length).toBe(6);
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

  it('does not show comparison column when shelkovoServices is null', () => {
    const { container, queryByText } = render(ServiceTable, {
      props: {
        services: mockServices,
        shelkovoServices: null
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

    // Find rows where there's a difference (snow_removal: partial vs yes, emergency_service: no vs yes, dispatcher: undefined vs yes)
    const diffIndicators = container.querySelectorAll('[data-testid="diff-indicator"]');
    
    // There should be some differences highlighted
    expect(diffIndicators.length).toBeGreaterThan(0);
  });

  it('renders with empty/unknown services', () => {
    const emptyServices: ServiceModel = {};

    const { container } = render(ServiceTable, {
      props: {
        services: emptyServices,
        shelkovoServices: null
      }
    });

    const rows = container.querySelectorAll('[data-testid="service-row"]');
    expect(rows.length).toBe(6);
  });
});
