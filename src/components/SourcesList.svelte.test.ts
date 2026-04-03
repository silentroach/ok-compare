import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import SourcesList from './SourcesList.svelte';
import type { Source } from '../lib/schema';

describe('SourcesList', () => {
  const mockSources: Source[] = [
    {
      title: 'Сайт УК КП Шелково',
      url: 'https://shelkovo-kp.ru',
      type: 'official',
      date_checked: '2026-03-10',
      comment: 'Официальный сайт управляющей компании'
    },
    {
      title: 'Чат жителей (Telegram)',
      url: 'https://t.me/shelkovo_chat',
      type: 'community',
      date_checked: '2026-03-15',
      comment: ''
    },
    {
      title: 'Статья в газете',
      url: 'https://example.com/article',
      type: 'media',
      date_checked: '2026-02-20',
      comment: 'Публикация о тарифах'
    }
  ];

  it('renders all sources with correct data', () => {
    const { container } = render(SourcesList, {
      props: { sources: mockSources }
    });

    expect(container.textContent).toContain('Сайт УК КП Шелково');
    expect(container.textContent).toContain('Чат жителей (Telegram)');
    expect(container.textContent).toContain('Статья в газете');
    
    // Check dates are rendered in Russian format (DD MMMM YYYY)
    expect(container.textContent).toContain('10 марта 2026');
    expect(container.textContent).toContain('15 марта 2026');
    expect(container.textContent).toContain('20 февраля 2026');
  });

  it('renders source type badges with correct labels', () => {
    const { container } = render(SourcesList, {
      props: { sources: mockSources }
    });

    expect(container.textContent).toContain('Официальный');
    expect(container.textContent).toContain('Сообщество');
    expect(container.textContent).toContain('СМИ');
  });

  it('renders source type badges with correct colors', () => {
    const { container } = render(SourcesList, {
      props: { sources: mockSources }
    });

    const officialBadge = container.querySelector('.bg-green-100');
    const communityBadge = container.querySelector('.bg-blue-100');
    const mediaBadge = container.querySelector('.bg-purple-100');

    expect(officialBadge).toBeTruthy();
    expect(communityBadge).toBeTruthy();
    expect(mediaBadge).toBeTruthy();
  });

  it('renders clickable links with correct URLs', () => {
    const { container } = render(SourcesList, {
      props: { sources: mockSources }
    });

    const links = container.querySelectorAll('[data-testid="source-link"]');
    expect(links).toHaveLength(3);
    
    expect(links[0].getAttribute('href')).toBe('https://shelkovo-kp.ru');
    expect(links[0].getAttribute('target')).toBe('_blank');
    expect(links[0].getAttribute('rel')).toBe('noopener noreferrer');
    
    expect(links[1].getAttribute('href')).toBe('https://t.me/shelkovo_chat');
    expect(links[2].getAttribute('href')).toBe('https://example.com/article');
  });

  it('renders comments when provided', () => {
    const { container } = render(SourcesList, {
      props: { sources: mockSources }
    });

    expect(container.textContent).toContain('Официальный сайт управляющей компании');
    expect(container.textContent).toContain('Публикация о тарифах');
  });

  it('renders empty list without errors', () => {
    const { container } = render(SourcesList, {
      props: { sources: [] }
    });

    const list = container.querySelector('[data-testid="sources-list"]');
    expect(list).toBeTruthy();
    expect(list?.children).toHaveLength(0);
  });

  it('renders personal source type with gray badge', () => {
    const personalSource: Source[] = [{
      title: 'Личное наблюдение',
      url: 'https://example.com',
      type: 'personal',
      date_checked: '2026-03-01',
      comment: ''
    }];

    const { container } = render(SourcesList, {
      props: { sources: personalSource }
    });

    expect(container.textContent).toContain('Личное');
    const personalBadge = container.querySelector('.bg-gray-100');
    expect(personalBadge).toBeTruthy();
  });
});
