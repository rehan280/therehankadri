import { permanentRedirect } from "next/navigation";

export default function LegacyYouTubeChannelStatisticsPage() {
  permanentRedirect("/stats/youtube-channels");
}
