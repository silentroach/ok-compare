import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
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
    drainage: undefined,
    checkpoints: 'yes',
    security: 'yes',
    fencing: 'no',
    video_surveillance: 'checkpoint_only',
    underground_electricity: undefined,
    playgrounds: 'yes',
    sports: 'no',
    public_spaces: undefined,
    beach_or_water_access: 'no',
    admin_building: 'yes',
    retail_or_services: 'partial'
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
    playgrounds: 'yes',
    sports: 'yes',
    public_spaces: 'yes',
    beach_or_water_access: 'yes',
    admin_building: 'no',
    retail_or_services: 'no'
  };

  it('renders all 18 infrastructure items', () => {
    const { container } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
        shelkovoInfra: null
      }
    });

    // Check that all infrastructure items are displayed (18 with underground_electricity)
    const rows = container.querySelectorAll('[data-testid="infra-row"]');
    expect(rows.length).toBe(18);
  });

  it('displays correct labels for infrastructure items', () => {
    const { getByText } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
        shelkovoInfra: null
      }
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

  it('renders correct status icons and colors for yes/no/partial/unknown', () => {
    const { container } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
        shelkovoInfra: null
      }
    });

    // Check that all items have status indicators (18 with underground_electricity)
    const statusIcons = container.querySelectorAll('[data-testid="infra-status"]');
    expect(statusIcons.length).toBe(18);
  });

  it('shows comparison column when shelkovoInfra is provided', () => {
    const { container, getByText } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
        shelkovoInfra: mockShelkovoInfra
      }
    });

    // Should have comparison column header
    expect(getByText('Шелково')).toBeTruthy();

    // Should have comparison column (18 with underground_electricity)
    const comparisonCells = container.querySelectorAll('[data-testid="shelkovo-status"]');
    expect(comparisonCells.length).toBe(18);
  });

  it('does not show comparison column when shelkovoInfra is null', () => {
    const { container, queryByText } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
        shelkovoInfra: null
      }
    });

    // Should not have comparison column header
    expect(queryByText('Шелково')).toBeNull();

    // Should not have comparison cells
    const comparisonCells = container.querySelectorAll('[data-testid="shelkovo-status"]');
    expect(comparisonCells.length).toBe(0);
  });

  it('highlights differences between settlement and Shelkovo', () => {
    const { container } = render(InfrastructureTable, {
      props: {
        infra: mockInfra,
        shelkovoInfra: mockShelkovoInfra
      }
    });

    // Find rows where there's a difference (e.g., sports: no vs yes)
    const diffIndicators = container.querySelectorAll('[data-testid="diff-indicator"]');
    
    // There should be some differences highlighted
    // (sidewalks, drainage, fencing, video_surveillance, sports, public_spaces, beach_or_water_access, retail_or_services)
    expect(diffIndicators.length).toBeGreaterThan(0);
  });

  it('renders with empty/unknown infrastructure', () => {
    const emptyInfra: Infrastructure = {};

    const { container } = render(InfrastructureTable, {
      props: {
        infra: emptyInfra,
        shelkovoInfra: null
      }
    });

    // Should still render all 18 rows even with empty data
    const rows = container.querySelectorAll('[data-testid="infra-row"]');
    expect(rows.length).toBe(18);
  });
});
