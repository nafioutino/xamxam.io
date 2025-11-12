"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

interface CreatorInfo {
  nickname: string | null;
  avatarUrl?: string | null;
  privacy_level_options: string[];
  interactions: {
    allow_comment_configurable: boolean;
    allow_duet_configurable: boolean;
    allow_stitch_configurable: boolean;
    duet_enabled: boolean;
    stitch_enabled: boolean;
  };
  can_post_now: boolean;
  max_video_post_duration_sec: number;
}

export default function TikTokPostPage() {
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [privacy, setPrivacy] = useState<string>("SELF_ONLY");
  const [publishMode, setPublishMode] = useState<string>("direct");

  const [allowComment, setAllowComment] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [allowStitch, setAllowStitch] = useState(true);

  const [disclosureOn, setDisclosureOn] = useState(false);
  const [disclosureBrandSelf, setDisclosureBrandSelf] = useState(false);
  const [disclosureBrandedContent, setDisclosureBrandedContent] = useState(false);

  const [consentMusic, setConsentMusic] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [videoDurationSec, setVideoDurationSec] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLoadingInfo(true);
    fetch("/api/tiktok/creator-info")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: CreatorInfo) => {
        setCreatorInfo(data);
        // Ajuster interactions initiales
        if (data?.interactions) {
          setAllowComment(Boolean(data.interactions.allow_comment_configurable));
          setAllowDuet(Boolean(data.interactions.duet_enabled));
          setAllowStitch(Boolean(data.interactions.stitch_enabled));
        }
      })
      .catch((e) => setErrorInfo(e.message))
      .finally(() => setLoadingInfo(false));
  }, []);

  // Gestion fichier vidéo et durée
  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null);
      setVideoDurationSec(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(url);
    // Nettoyer l'URL objet lorsqu'on change de fichier ou démonte le composant
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  // Lire la durée depuis l'élément de prévisualisation une fois les métadonnées chargées
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const onLoadedMetadata = () => {
      const dur = Math.floor(el.duration || 0);
      setVideoDurationSec(dur);
    };
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [videoPreviewUrl]);

  const canPublish = useMemo(() => {
    const titleOk = title.trim().length > 0 && title.trim().length <= 150; // legacy validation
    const privacyOk = ["SELF_ONLY", "MUTUAL_FOLLOW_FRIENDS", "PUBLIC_TO_EVERYONE"].includes(privacy);
    const consentOk = consentMusic;
    const videoOk = Boolean(videoFile);
    const capsOk = creatorInfo?.can_post_now !== false;
    const durationOk = videoDurationSec == null || (creatorInfo?.max_video_post_duration_sec ? videoDurationSec <= creatorInfo.max_video_post_duration_sec : true);
    const disclosureOk = !disclosureOn || (disclosureBrandSelf || disclosureBrandedContent);
    return titleOk && privacyOk && consentOk && videoOk && capsOk && durationOk && disclosureOk;
  }, [title, privacy, consentMusic, videoFile, creatorInfo, videoDurationSec, disclosureOn, disclosureBrandSelf, disclosureBrandedContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    if (!canPublish || !videoFile) return;
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("publishMode", publishMode);
      fd.append("privacy", privacy);
      fd.append("video", videoFile);
      fd.append("allowComment", String(allowComment));
      fd.append("allowDuet", String(allowDuet));
      fd.append("allowStitch", String(allowStitch));

      const res = await fetch("/api/tiktok/publish", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      setSubmitSuccess(data.message || "Publication réussie !");
      setPublishedUrl(data.tiktokUrl || null);

      // Réinitialiser les champs d'entrée et l'état de fichier après succès
      setTitle("");
      setVideoFile(null);
      setVideoPreviewUrl(null);
      setVideoDurationSec(null);
      setDisclosureOn(false);
      setDisclosureBrandSelf(false);
      setDisclosureBrandedContent(false);
      setConsentMusic(false);
      if (fileInputRef.current) {
        try {
          // Nettoyer la valeur de l'input file pour éviter que le même fichier reste sélectionné
          (fileInputRef.current as HTMLInputElement).value = "";
        } catch {}
      }
    } catch (err: any) {
      setSubmitError(err.message || "Erreur lors de la publication");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6 flex items-center gap-3">
        {creatorInfo?.avatarUrl ? (
          <img src={creatorInfo.avatarUrl} alt="Avatar TikTok" className="h-10 w-10 rounded-full border border-gray-200" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-200" />
        )}
        <div>
          <h1 className="text-2xl font-semibold">Publier sur TikTok</h1>
          {creatorInfo?.nickname && (
            <p className="text-sm text-gray-600 mt-1">Connecté en tant que @{creatorInfo.nickname}</p>
          )}
        </div>
      </div>

      {loadingInfo && <p>Chargement des informations créateur…</p>}
      {errorInfo && (
        <p className="text-red-600 mb-4">Impossible de récupérer creator_info: {errorInfo}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre de la vidéo</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={150}
            placeholder="Décrivez votre vidéo (≤150 caractères)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
          <p className="text-xs text-gray-500 mt-1">{title.length}/150</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Qui peut voir cette vidéo</label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              {creatorInfo?.privacy_level_options?.includes("SELF_ONLY") && (
                <option value="SELF_ONLY">Moi uniquement</option>
              )}
              {creatorInfo?.privacy_level_options?.includes("MUTUAL_FOLLOW_FRIENDS") && (
                <option value="MUTUAL_FOLLOW_FRIENDS">Amis (abonnements mutuels)</option>
              )}
              {creatorInfo?.privacy_level_options?.includes("PUBLIC_TO_EVERYONE") && (
                <option value="PUBLIC_TO_EVERYONE">Tout le monde</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode de publication</label>
            <select
              value={publishMode}
              onChange={(e) => setPublishMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="direct">Publier maintenant</option>
              <option value="draft">Enregistrer en brouillon</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {publishMode === "draft" ? "📝 Sera sauvegardé dans vos brouillons TikTok" : "🚀 Publication immédiate sur votre profil"}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vidéo (MP4 recommandé)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-pink-500 hover:bg-pink-50 transition-colors cursor-pointer"
          >
            {videoFile ? (
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-700">{videoFile.name}</p>
                  <p className="text-xs text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  type="button"
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); setVideoFile(null); }}
                >
                  Changer
                </button>
              </div>
            ) : (
              <div className="text-gray-600">
                <p className="text-sm">Cliquez pour choisir une vidéo</p>
                <p className="text-xs">Formats supportés: MP4, WebM, MOV</p>
              </div>
            )}
          </div>
          {videoPreviewUrl && (
            <video ref={videoRef} src={videoPreviewUrl} controls className="mt-3 w-full rounded-lg" />
          )}
          {creatorInfo?.max_video_post_duration_sec && videoDurationSec != null && videoDurationSec > creatorInfo.max_video_post_duration_sec && (
            <p className="text-xs text-red-600 mt-1">
              Durée ({videoDurationSec}s) au-delà de la limite autorisée ({creatorInfo.max_video_post_duration_sec}s).
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autoriser les commentaires</label>
            <select
              value={allowComment ? "true" : "false"}
              onChange={(e) => setAllowComment(e.target.value === "true")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 cursor-pointer"
              disabled={!creatorInfo?.interactions?.allow_comment_configurable}
            >
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autoriser Duet</label>
            <select
              value={allowDuet ? "true" : "false"}
              onChange={(e) => setAllowDuet(e.target.value === "true")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 cursor-pointer"
              disabled={!creatorInfo?.interactions?.allow_duet_configurable}
            >
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autoriser Stitch</label>
            <select
              value={allowStitch ? "true" : "false"}
              onChange={(e) => setAllowStitch(e.target.value === "true")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 cursor-pointer"
              disabled={!creatorInfo?.interactions?.allow_stitch_configurable}
            >
              <option value="true">Oui</option>
              <option value="false">Non</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Divulgation commerciale</label>
          <div className="flex items-center gap-2 mb-2">
            <input id="disclosure-on" type="checkbox" checked={disclosureOn} onChange={(e) => setDisclosureOn(e.target.checked)} className="cursor-pointer" />
            <label htmlFor="disclosure-on" className="text-sm cursor-pointer">Cette vidéo promeut une marque/produit/service</label>
          </div>
          {disclosureOn && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <input id="disclosure-brand-self" type="checkbox" checked={disclosureBrandSelf} onChange={(e) => setDisclosureBrandSelf(e.target.checked)} className="cursor-pointer" />
                <label htmlFor="disclosure-brand-self" className="text-sm cursor-pointer">Ma marque (personnel/entreprise)</label>
              </div>
              <div className="flex items-center gap-2">
                <input id="disclosure-branded-content" type="checkbox" checked={disclosureBrandedContent} onChange={(e) => setDisclosureBrandedContent(e.target.checked)} className="cursor-pointer" />
                <label htmlFor="disclosure-branded-content" className="text-sm cursor-pointer">Contenu sponsorisé / Branded content</label>
              </div>
              {!disclosureBrandSelf && !disclosureBrandedContent && (
                <p className="text-xs text-red-600">Sélectionnez au moins une option de divulgation</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-start gap-2">
          <input
            id="consent-music"
            type="checkbox"
            checked={consentMusic}
            onChange={(e) => setConsentMusic(e.target.checked)}
            className="mt-1 cursor-pointer"
          />
          <label htmlFor="consent-music" className="text-sm text-gray-700 cursor-pointer">
            En publiant, vous acceptez la Confirmation d’utilisation de la musique de TikTok.
          </label>
        </div>

        {!creatorInfo?.can_post_now && (
          <p className="text-sm text-red-600">Vous ne pouvez pas publier pour le moment. Réessayez plus tard.</p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!canPublish || submitting}
            className={`px-4 py-2 rounded-lg text-white ${canPublish ? "bg-pink-600 hover:bg-pink-700 cursor-pointer" : "bg-gray-400"}`}
          >
            {submitting ? "Publication…" : "Publier sur TikTok"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => setPublishMode(publishMode === "direct" ? "draft" : "direct")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50 cursor-pointer"
          >
            {publishMode === "direct" ? "Enregistrer en brouillon" : "Publier maintenant"}
          </button>
        </div>

        {submitError && <p className="text-red-600 mt-2">{submitError}</p>}
        {submitSuccess && (
          <div className="mt-2 text-green-700">
            <p>{submitSuccess}</p>
            {publishedUrl && (
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-pink-600 hover:text-pink-700 underline cursor-pointer"
              >
                Voir la publication sur TikTok
              </a>
            )}
          </div>
        )}
      </form>
    </div>
  );
}