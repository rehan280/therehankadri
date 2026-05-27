export type Testimonial = {
  name: string;
  channel: string;
  subscribers: string;
  quote: string;
};

export function getToolTestimonials(slug: string, title: string): Testimonial[] {
  if (slug === "youtube-tags-generator") {
    return [
      {
        name: "Marcus T.",
        channel: "TechTalkMarcus",
        subscribers: "12K subs",
        quote: "I used to copy-paste random tags and hope for the best. This tool gave me focused, relevant tags in seconds. My next video hit 3x more impressions in the first 48 hours.",
      },
      {
        name: "Priya S.",
        channel: "DesignWithPriya",
        subscribers: "8.4K subs",
        quote: "No login, no paywall, no bloat. Just paste your title and get clean tags. I switched from vidIQ’s tag tool and honestly this is faster and less overwhelming.",
      },
      {
        name: "Jordan L.",
        channel: "FinanceFor20s",
        subscribers: "31K subs",
        quote: "The tags it generates actually match the intent of my videos. Not generic junk. I’ve been recommending this to every creator in my mastermind group.",
      },
    ];
  }

  if (slug.includes("title")) {
    return [
      { name: "Sarah K.", channel: "SarahTech", subscribers: "15K subs", quote: "I was struggling to get clicks on my videos. This tool gave me 5 amazing title ideas instantly. My latest video has double the CTR." },
      { name: "David M.", channel: "FinanceDaily", subscribers: "42K subs", quote: "Best free tool for brainstorming. I just paste my topic and get actual clickable titles instead of boring ones." },
      { name: "Elena V.", channel: "ElenaVlogs", subscribers: "8K subs", quote: "I love how easy it is to use. The titles look super natural and totally helped my last upload go semi viral." }
    ];
  }
  
  if (slug.includes("description")) {
    return [
      { name: "Mike T.", channel: "MikeReviews", subscribers: "22K subs", quote: "Writing descriptions took me forever. Now I just use this to pull exactly what I need and my SEO is way better." },
      { name: "Jessica L.", channel: "JessCrafts", subscribers: "11K subs", quote: "I hate writing video descriptions. This tool makes it so fast and it pulls all the important keywords perfectly." },
      { name: "Tom H.", channel: "GamingWithTom", subscribers: "89K subs", quote: "Super clean layout and no annoying ads. It grabs the descriptions I want to study in literally one second." }
    ];
  }
  
  if (slug.includes("start-time") || slug.includes("link")) {
    return [
      { name: "Alex R.", channel: "AlexReacts", subscribers: "55K subs", quote: "I used to manually calculate timestamps for my links. This generator saves me so much time when replying to comments." },
      { name: "Chris P.", channel: "ChrisTutorials", subscribers: "30K subs", quote: "Such a handy utility. I keep this tab open all day when I am dropping links in my community posts." },
      { name: "Samira W.", channel: "SamiraCooks", subscribers: "18K subs", quote: "Really simple and works perfectly every time. Great for sending people to the exact recipe steps in my videos." }
    ];
  }
  
  return [
    { name: "Kevin B.", channel: "KevinBuilds", subscribers: "14K subs", quote: `I was looking for a good ${title.toLowerCase()} and found this. Honestly it works perfectly and is super fast.` },
    { name: "Rachel G.", channel: "RachelFitness", subscribers: "27K subs", quote: "No paywalls or annoying popups. Just a solid tool that does exactly what it promises. Will definitely bookmark." },
    { name: "Daniel J.", channel: "DanTech", subscribers: "105K subs", quote: "I share this with all my creator friends. It is a really clean website and it actually delivers good results." }
  ];
}
