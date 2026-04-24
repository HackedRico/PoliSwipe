import type { Source } from '@/types';

export const GLOBAL_PROMPTS = [
  'What\'s on my ballot?',
  'Any rallies this week?',
  'Explain the data center issue',
];

interface ScriptedReply {
  text: string;
  sources?: Source[];
}

export const SCRIPTED: Record<string, Record<string, ScriptedReply>> = {
  card_01: {
    'What\'s the timeline?': {
      text: 'The PG County Council imposed a 180-day moratorium starting March 1. That means the earliest a vote could happen is late August 2026. But public pressure during the comment period (open now through May 30) is when your voice matters most.',
      sources: [{ title: 'PG County Council \u00B7 Moratorium resolution', date: 'Mar 1' }],
    },
    'How does this affect my rent?': {
      text: 'Data centers are massive electricity consumers. The proposed facility would use 400-600 MW \u2014 enough to power 300,000 homes. BGE has warned that increased grid strain could lead to rate hikes of 15-30% for residential customers in PG County, including off-campus housing.',
    },
    'Who supports this?': {
      text: 'The developer (QTS Realty) and some county officials point to $500M in tax revenue and 100+ permanent jobs. But local residents, environmental groups, and most student organizations oppose it due to environmental and cost concerns.',
    },
  },
  card_02: {
    'What should I bring?': {
      text: 'Organizers recommend: water bottle, comfortable shoes, sunscreen, and a sign if you have one. Sign-making supplies will be available at 1:30pm. No glass containers. Emergency contacts posted at the info table.',
    },
    'Will it be peaceful?': {
      text: 'Yes \u2014 this is organized by CEEJH, a UMD research center. Faculty advisors will be present. UMPD has been notified and will be managing traffic. It\'s a permitted, peaceful demonstration.',
    },
  },
  card_05: {
    'When is the vote?': {
      text: 'The Senate is expected to vote the week of April 28. Sen. Van Hollen is a co-sponsor, so Maryland\'s delegation is likely to vote yes. The House version still needs committee markup.',
    },
    'How much do I get?': {
      text: 'If you currently receive Pell Grants, the maximum award would increase from $7,395 to $8,595 per year \u2014 that\'s $1,200 more. If you\'re not Pell-eligible, it doesn\'t directly affect you, but 34% of UMD undergrads receive some form of Pell.',
    },
  },
};

export const GLOBAL_REPLIES: Record<string, string> = {
  'What\'s on my ballot?': 'Based on your College Park address, here\'s what\'s coming up:\n\n\u2022 **PG County Council Primary** \u2014 June 24 (District 3, 3 candidates)\n\u2022 **Maryland Governor\'s race** \u2014 November 2026\n\u2022 **U.S. House MD-4** \u2014 November 2026\n\nEarly voting for the primary starts June 14. Want me to compare the District 3 candidates?',
  'Any rallies this week?': 'I found 2 events near campus this week:\n\n1. **Sunrise UMD Climate Strike** \u2014 Friday noon, McKeldin Mall (287 RSVPs)\n2. **Data Center Rally** \u2014 Saturday 2pm, Hornbake Plaza (403 RSVPs)\n\nBoth are student-organized and peaceful. Want to RSVP to either?',
  'Explain the data center issue': 'Here\'s the short version:\n\nQTS Realty wants to build a massive data center on the old Landover Mall site, 6 miles from campus. It would use as much electricity as 300,000 homes.\n\n**Why students care:** Potential 15-30% electricity rate hikes, air quality concerns, and the irony of CS students\' work powering the very infrastructure harming their community.\n\n**Where it stands:** PG County imposed a 180-day moratorium. 20,000+ petition signatures. Public comment open through May 30.',
};

export const FALLBACK_REPLY = 'That\'s a great question. Based on what I know about this issue, let me look into it and give you a detailed answer. In the meantime, you can check the sources linked on the card for primary information.';
