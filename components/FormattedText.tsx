import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TEXT } from '@/theme/typography';
import { PS_TOKENS } from '@/theme/tokens';

interface FormattedTextProps {
  text: string;
  color: string;
}

/** Renders a markdown-ish string with bold, bullets, and numbered lists. */
export function FormattedText({ text, color }: FormattedTextProps) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines but add spacing
    if (line.trim() === '') {
      elements.push(<View key={i} style={styles.spacer} />);
      continue;
    }

    // Bullet points: - or * at start
    const bulletMatch = line.match(/^\s*[-*]\s+(.*)/);
    if (bulletMatch) {
      elements.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.bullet, { color }]}>{'\u2022'}</Text>
          <Text style={[TEXT.chatBody, { color, flex: 1 }]}>
            {renderInline(bulletMatch[1], color)}
          </Text>
        </View>
      );
      continue;
    }

    // Numbered lists: 1. or 1) at start
    const numMatch = line.match(/^\s*(\d+)[.)]\s+(.*)/);
    if (numMatch) {
      elements.push(
        <View key={i} style={styles.bulletRow}>
          <Text style={[styles.number, { color }]}>{numMatch[1]}.</Text>
          <Text style={[TEXT.chatBody, { color, flex: 1 }]}>
            {renderInline(numMatch[2], color)}
          </Text>
        </View>
      );
      continue;
    }

    // Headers: strip # and bold
    const headerMatch = line.match(/^#{1,3}\s+(.*)/);
    if (headerMatch) {
      elements.push(
        <Text key={i} style={[TEXT.chatBody, { color, fontWeight: '700', marginTop: 4 }]}>
          {renderInline(headerMatch[1], color)}
        </Text>
      );
      continue;
    }

    // Regular line
    elements.push(
      <Text key={i} style={[TEXT.chatBody, { color }]}>
        {renderInline(line, color)}
      </Text>
    );
  }

  return <View>{elements}</View>;
}

/** Parses **bold** and *italic* within a line. */
function renderInline(text: string, color: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Match **bold** or *italic*
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <Text key={match.index} style={{ fontWeight: '700' }}>
          {match[2]}
        </Text>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <Text key={match.index} style={{ fontStyle: 'italic' }}>
          {match[3]}
        </Text>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

const styles = StyleSheet.create({
  spacer: {
    height: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  bullet: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '600',
    width: 12,
  },
  number: {
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: '600',
    width: 18,
  },
});
