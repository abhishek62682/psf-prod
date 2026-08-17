import { Link, useParams } from "react-router-dom";
import useSWR from "swr";
import { Reveal } from "@/components/Reveal";
import { ProgressBar } from "@/components/ProgressBar";
import { getCampaignById, getCampaignDonations } from "@/config/api/campaign.api";
import { getAssetUrl } from "@/Utils/constant";
import { formatCurrency, formatDonorDate, getInitials, getAvatarColor } from "@/data/donorsData";

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: campaign, isLoading, error } = useSWR(
    id ? ["campaign", id] : null,
    () => getCampaignById(id!)
  );
  const { data: donationsData } = useSWR(
    id ? ["campaign-donations", id] : null,
    () => getCampaignDonations(id!, { limit: 10 })
  );
  const donations = donationsData?.donations ?? [];

  if (isLoading) {
    return (
      <section className="bg-warm pt-36 pb-28 md:pt-44 md:pb-36">
        <p className="text-center text-sm text-[#111111]/30">Loading campaign…</p>
      </section>
    );
  }

  if (error || !campaign) {
    return (
      <section className="bg-warm pt-36 pb-28 md:pt-44 md:pb-36">
        <div className="max-w-container mx-auto px-6 text-center">
          <h1 className="font-serif text-3xl text-[#111111] mb-4">Campaign not found</h1>
          <p className="text-sm text-[#111111]/40 mb-8">
            This campaign may have been removed or is no longer active.
          </p>
          <Link
            to="/campaigns"
            className="btn-press bg-accent text-white text-sm font-medium px-6 py-3 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400 inline-block"
          >
            ← Back to Campaigns
          </Link>
        </div>
      </section>
    );
  }

  const goalReached = campaign.progress >= 100;

  return (
    <>
      <section className="bg-warm pt-36 pb-12 md:pt-44 md:pb-16">
        <div className="max-w-container mx-auto px-6">
          <Reveal>
            <Link to="/campaigns" className="text-sm font-medium text-accent hover:text-[#d93a56] transition-colors duration-300">
              ← Back to Campaigns
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ===== CAMPAIGN HERO ===== */}
      <section className="bg-warm pb-20 md:pb-28">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <Reveal className="rounded-sm overflow-hidden relative mb-10">
              {campaign.isFeatured && (
                <span className="label-text bg-accent text-white px-3 py-1 rounded-sm absolute top-4 right-4 z-10 text-[10px]">
                  Featured
                </span>
              )}
              <img
                src={getAssetUrl(campaign.coverImage) || `https://picsum.photos/seed/${campaign.slug}/1200/600.jpg`}
                alt={campaign.title}
                className="w-full h-[260px] md:h-[420px] object-cover"
                loading="lazy"
              />
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2">
                <Reveal as="h1" className="font-serif text-[32px] md:text-[48px] text-[#111111] leading-[1.1] tracking-tight mb-4">
                  {campaign.title}
                </Reveal>
                <Reveal as="p" className="reveal-delay-1 text-base text-[#111111]/50 leading-relaxed mb-8">
                  {campaign.shortDescription}
                </Reveal>
                <Reveal className="reveal-delay-2 text-sm text-[#111111]/45 leading-relaxed whitespace-pre-line">
                  {campaign.description}
                </Reveal>

                {campaign.gallery.length > 0 && (
                  <Reveal className="reveal-delay-3 mt-10">
                    <p className="label-text text-[#111111]/30 mb-4">GALLERY</p>
                    <div className="columns-2 sm:columns-3 gap-3 [&>*]:mb-3">
                      {campaign.gallery.map((img) => (
                        <div key={img} className="rounded-sm overflow-hidden break-inside-avoid">
                          <img src={getAssetUrl(img)} alt="" className="w-full h-auto object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </Reveal>
                )}

                {campaign.documents && campaign.documents.length > 0 && (
                  <Reveal className="reveal-delay-3 mt-10">
                    <p className="label-text text-[#111111]/30 mb-4">DOCUMENTS</p>
                    <div className="space-y-2">
                      {campaign.documents.map((doc) => (
                        <a
                          key={doc.url}
                          href={getAssetUrl(doc.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between border border-[#111111]/[0.07] rounded-sm px-4 py-3 text-sm text-[#111111]/60 hover:text-accent hover:border-accent/30 transition-colors duration-300"
                        >
                          <span>{doc.label}</span>
                          <span className="text-accent text-xs font-medium">View / Download →</span>
                        </a>
                      ))}
                    </div>
                  </Reveal>
                )}
              </div>

              <div>
                <Reveal className="border border-[#111111]/[0.07] rounded-sm p-6 md:p-8 bg-warm-alt sticky top-24">
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#111111]/50">{formatCurrency(campaign.raisedAmount)} Raised</span>
                      <span className="text-accent font-medium">{campaign.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#111111]/[0.06] rounded-full overflow-hidden">
                      <ProgressBar target={`${campaign.progress}%`} />
                    </div>
                    <p className="text-xs text-[#111111]/25 mt-2">of {formatCurrency(campaign.goalAmount)} goal</p>
                  </div>

                  <div className="flex items-center gap-6 mb-6 text-sm text-[#111111]/50">
                    <div>
                      <p className="font-serif text-2xl text-[#111111]">{campaign.totalDonors}</p>
                      <p className="text-xs text-[#111111]/30">Supporters</p>
                    </div>
                    <div>
                      <p className="font-serif text-2xl text-[#111111] capitalize">{campaign.status}</p>
                      <p className="text-xs text-[#111111]/30">Status</p>
                    </div>
                  </div>

                  {goalReached ? (
                    <p className="text-sm font-medium text-accent">Goal Reached 🎉</p>
                  ) : (
                    <Link
                      to={`/donate?campaignId=${campaign._id}`}
                      className="btn-press bg-accent text-white text-sm font-medium px-6 py-3 rounded-sm hover:bg-[#d93a56] hover:shadow-lg hover:shadow-accent/20 transition-all duration-400 inline-block w-full text-center"
                    >
                      Support This Campaign <span className="inline-block ml-1">→</span>
                    </Link>
                  )}
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RECENT SUPPORTERS ===== */}
      {donations.length > 0 && (
        <section className="bg-warm-alt py-20 md:py-28 border-t border-[#111111]/[0.04]">
          <div className="max-w-container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <Reveal as="p" className="label-text text-accent mb-6 text-center">
                ●&nbsp; RECENT SUPPORTERS
              </Reveal>
              <div className="border-t border-[#111111]/[0.06]">
                {donations.map((d, i) => (
                  <div
                    key={`${d.name}-${i}`}
                    className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-[#111111]/[0.04]"
                  >
                    <div className={`avatar-circle w-9 h-9 rounded-full ${getAvatarColor(d.name)} text-xs shrink-0`}>
                      {getInitials(d.name)}
                    </div>
                    <span className="text-sm font-medium text-[#111111] flex-1 truncate">{d.name}</span>
                    <span className="text-sm font-medium text-[#111111]">{formatCurrency(d.amount)}</span>
                    <span className="text-xs text-[#111111]/30 w-24 text-right shrink-0">{formatDonorDate(d.date)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA ===== */}
      <section className="bg-warm py-28 md:py-36 border-t border-[#111111]/[0.04]">
        <div className="max-w-container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <Reveal as="h2" className="font-serif text-[36px] md:text-[48px] text-[#111111] leading-[1.1] tracking-tight mb-6">
              Explore other causes
            </Reveal>
            <Reveal as="p" className="reveal-delay-1 text-base text-[#111111]/45 leading-relaxed mb-10 max-w-lg mx-auto">
              Every campaign is a chance to change a life. Browse our other active campaigns and find the one that
              resonates with you.
            </Reveal>
            <Reveal className="reveal-delay-2">
              <Link
                to="/campaigns"
                className="btn-press bg-[#111111] text-white text-sm font-medium px-8 py-3.5 rounded-sm hover:bg-[#1a1a1c] hover:shadow-lg hover:shadow-[#111111]/15 transition-all duration-400 inline-block"
              >
                View All Campaigns <span className="inline-block ml-1">→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
