import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import { Colors, Typography, Spacing, Shadows } from '../../constants/colors';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { DatabaseService } from '../../services/database/databaseService';
import { ActivityService } from '../../services/activity/activityService';
import { KalaPost, KalaComment, KalaPostMediaType, KalaPostStoryType } from '../../models/kalachannel';
import { Product } from '../../models/product';
import { supabase } from '../../services/supabase/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const KalaChannelScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [posts, setPosts] = useState<KalaPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'video' | 'image' | 'story'>('all');

  // Video playback states
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [videoLoadingState, setVideoLoadingState] = useState<Record<string, boolean>>({});

  // Post creation modal state
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [createStep, setCreateStep] = useState<'choose_type' | 'enter_details'>('choose_type');
  const [chosenMediaType, setChosenMediaType] = useState<KalaPostMediaType>('image');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [storyType, setStoryType] = useState<KalaPostStoryType>('craft_story');
  const [caption, setCaption] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Comments modal state
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<KalaComment[]>([]);
  const [commentText, setCommentText] = useState<string>('');
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [postsRes, prodsRes] = await Promise.all([
        DatabaseService.getKalaPosts(user?.id),
        user?.id ? DatabaseService.getArtisanProducts(user.id, 'published') : Promise.resolve({ data: [] }),
      ]);
      if (postsRes.data) {
        setPosts(postsRes.data);
      }
      if (prodsRes.data) {
        setProducts(prodsRes.data);
      }
    } catch (e) {
      console.warn('Error loading KalaChannel data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    // Supabase Realtime channel for live posts, likes & comments
    const channel = supabase
      .channel('public:kalachannel_feed')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_likes' },
        () => {
          loadData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'post_comments' },
        (payload: any) => {
          loadData();
          if (activeCommentsPostId && payload.new && (payload.new as any).post_id === activeCommentsPostId) {
            DatabaseService.getPostComments(activeCommentsPostId).then(res => {
              if (res.data) setComments(res.data);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeCommentsPostId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePickMedia = async (type: KalaPostMediaType, useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Camera permission is required to capture craft footage.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: type === 'video' ? ['videos'] : ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Needed', 'Gallery permission is required to select footage.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: type === 'video' ? ['videos'] : ['images'],
          allowsEditing: true,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setMediaUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('Media picker error:', e);
    }
  };

  const startCreationWith = (type: KalaPostMediaType) => {
    setChosenMediaType(type);
    setCreateStep('enter_details');
  };

  const handleCreatePost = async () => {
    if (!mediaUri) {
      Alert.alert('Footage Required', `Please choose or capture a craft ${chosenMediaType}.`);
      return;
    }
    if (!caption.trim()) {
      Alert.alert('Story Required', 'Please share a few words about this craft technique or heritage story.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedProd = products.find(p => p.id === selectedProductId);
      const res = await DatabaseService.createKalaPost({
        artisanId: user?.id || 'artisan-local',
        artisanName: user?.fullName || 'Artisan',
        artisanLocation: (user as any)?.location || 'India',
        artisanAvatarEmoji: '🎨',
        craftType: selectedProd?.info.craftType || 'Traditional Craft',
        mediaType: chosenMediaType,
        mediaUri,
        storyType,
        caption: caption.trim(),
        linkedProductId: selectedProductId,
        linkedProductTitle: selectedProd?.info.titleHi || selectedProd?.info.titleEn,
        linkedProductPrice: selectedProd?.pricing?.finalListingPrice || selectedProd?.pricing?.suggestedRetailPrice,
      });

      if (res.data) {
        setPosts(prev => [res.data!, ...prev]);
        if (user?.id) {
          await ActivityService.log(
            user.id,
            'STORY_POSTED',
            'Shared Craft Story on KalaChannel',
            'कलाचैनल पर शिल्प कथा साझा की',
            `Posted: "${caption.slice(0, 30)}..."`,
            `प्रकाशित: "${caption.slice(0, 30)}..."`
          );
        }

        setMediaUri(null);
        setCaption('');
        setSelectedProductId(undefined);
        setCreateStep('choose_type');
        setModalVisible(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!user?.id) return;
    const post = posts.find(p => p.id === postId);
    const wasLiked = post?.isLikedByMe;

    // Optimistic toggle
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const newLikes = wasLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1;
          return { ...p, isLikedByMe: !wasLiked, likesCount: newLikes };
        }
        return p;
      })
    );

    await DatabaseService.toggleLikePost(postId, user.id);
  };

  const handleOpenComments = async (postId: string) => {
    setActiveCommentsPostId(postId);
    setLoadingComments(true);
    try {
      const res = await DatabaseService.getPostComments(postId);
      if (res.data) setComments(res.data);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!activeCommentsPostId || !commentText.trim() || !user?.id) return;
    setSubmittingComment(true);
    try {
      const res = await DatabaseService.addPostComment(
        activeCommentsPostId,
        user.id,
        user.fullName || 'Patron',
        commentText.trim()
      );
      if (res.data) {
        setComments(prev => [...prev, res.data!]);
        setCommentText('');
        setPosts(prev =>
          prev.map(p =>
            p.id === activeCommentsPostId
              ? { ...p, commentsCount: (p.commentsCount || 0) + 1 }
              : p
          )
        );
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  // Filter posts
  const filteredPosts = posts.filter(p => {
    if (selectedFilter === 'video') return p.mediaType === 'video';
    if (selectedFilter === 'image') return p.mediaType === 'image';
    if (selectedFilter === 'story') return p.storyType === 'craft_story';
    return true;
  });

  return (
    <View style={styles.screen}>
      <Header
        title="KalaChannel"
        subtitle="Live Craft Storytelling, Videos & Heritage Discovery"
        onBack={navigation.canGoBack() ? () => navigation.goBack() : undefined}
        showLanguageToggle={true}
      />

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>
              🌟 All Stories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'video' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('video')}
          >
            <Text style={[styles.filterText, selectedFilter === 'video' && styles.filterTextActive]}>
              🎥 Short Videos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'image' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('image')}
          >
            <Text style={[styles.filterText, selectedFilter === 'image' && styles.filterTextActive]}>
              📸 Photo Stories
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'story' && styles.filterChipActive]}
            onPress={() => setSelectedFilter('story')}
          >
            <Text style={[styles.filterText, selectedFilter === 'story' && styles.filterTextActive]}>
              📜 Heritage Chronicles
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Creator CTA Banner for Artisans */}
        {user?.role === 'artisan' ? (
          <View style={[styles.createBanner, Shadows.soft]}>
            <View style={styles.createBannerLeft}>
              <Text style={styles.createBannerEmoji}>🎬</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.createBannerTitle}>Broadcast Your Craft</Text>
                <Text style={styles.createBannerSub}>
                  Publish short workshop videos or photo stories to direct buyers & patrons
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => {
                setCreateStep('choose_type');
                setModalVisible(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.createBtnText}>+ Create Story</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.discoveryBanner, Shadows.soft]}>
            <Text style={styles.discoveryEmoji}>✨</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.discoveryTitle}>Living Craft Traditions</Text>
              <Text style={styles.discoverySub}>
                Watch authentic handloom, blue pottery, and lost-wax casting recorded inside master artisan studios.
              </Text>
            </View>
          </View>
        )}

        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Fetching craft stories...</Text>
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={[styles.emptyCard, Shadows.soft]}>
            <Text style={styles.emptyEmoji}>📽️</Text>
            <Text style={styles.emptyTitle}>No Stories Found</Text>
            <Text style={styles.emptyDesc}>
              {user?.role === 'artisan'
                ? 'Be the first to share a video or photo from your workshop!'
                : 'No stories available in this category yet. Check back soon!'}
            </Text>
            {user?.role === 'artisan' && (
              <Button
                title="+ Create Craft Post"
                onPress={() => {
                  setCreateStep('choose_type');
                  setModalVisible(true);
                }}
                size="md"
                style={{ marginTop: Spacing.md }}
              />
            )}
          </View>
        ) : (
          filteredPosts.map(post => {
            const isVideo = post.mediaType === 'video';
            const isPlaying = playingVideoId === post.id;
            const isVideoBuffering = videoLoadingState[post.id];

            return (
              <View key={post.id} style={[styles.postCard, Shadows.soft]}>
                {/* Artisan Identity Header */}
                <View style={styles.postHeader}>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarEmoji}>{post.artisanAvatarEmoji || '🎨'}</Text>
                  </View>
                  <View style={styles.headerInfo}>
                    <View style={styles.artisanRow}>
                      <Text style={styles.artisanName}>{post.artisanName}</Text>
                      <View style={styles.verifiedBadge}>
                        <Text style={styles.verifiedBadgeText}>✓ Master Artisan</Text>
                      </View>
                    </View>
                    <Text style={styles.craftMeta}>
                      {post.craftType} {post.artisanLocation ? `• ${post.artisanLocation}` : ''}
                    </Text>
                  </View>
                  <View style={styles.formatPill}>
                    <Text style={styles.formatPillText}>
                      {isVideo ? '🎥 Short Video' : '📸 Craft Photo'}
                    </Text>
                  </View>
                </View>

                {/* Media Container: Video vs Image */}
                <View style={styles.mediaContainer}>
                  {isVideo ? (
                    <View style={styles.videoWrapper}>
                      <Video
                        source={{ uri: post.mediaUri }}
                        style={styles.videoPlayer}
                        resizeMode={ResizeMode.COVER}
                        isLooping
                        isMuted={isMuted}
                        shouldPlay={isPlaying}
                        onLoadStart={() => {
                          setVideoLoadingState(prev => ({ ...prev, [post.id]: true }));
                        }}
                        onLoad={() => {
                          setVideoLoadingState(prev => ({ ...prev, [post.id]: false }));
                        }}
                      />

                      {/* Buffering Indicator */}
                      {isVideoBuffering && (
                        <View style={styles.videoLoaderOverlay}>
                          <ActivityIndicator size="large" color="#FFF" />
                        </View>
                      )}

                      {/* Play/Pause Overlay Controls */}
                      <TouchableOpacity
                        style={styles.videoTapOverlay}
                        activeOpacity={0.8}
                        onPress={() => {
                          setPlayingVideoId(prev => (prev === post.id ? null : post.id));
                        }}
                      >
                        {!isPlaying && (
                          <View style={styles.playButtonCircle}>
                            <Text style={styles.playIconText}>▶</Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      {/* Video Utility Bar */}
                      <View style={styles.videoControlsRow}>
                        <TouchableOpacity
                          style={styles.soundControlBtn}
                          onPress={() => setIsMuted(prev => !prev)}
                        >
                          <Text style={styles.soundControlIcon}>{isMuted ? '🔇' : '🔊'}</Text>
                        </TouchableOpacity>

                        <View style={styles.videoBadge}>
                          <Text style={styles.videoBadgeText}>
                            {isPlaying ? '● LIVE WORKSHOP' : 'TAP TO PLAY'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ) : (
                    <Image source={{ uri: post.mediaUri }} style={styles.postImage} resizeMode="cover" />
                  )}
                </View>

                {/* Post Body */}
                <View style={styles.postBody}>
                  {/* Tagged Product Link (if present) */}
                  {post.linkedProductId && (
                    <TouchableOpacity
                      style={styles.productTagCard}
                      onPress={() => navigation.navigate('ProductDetails', { productId: post.linkedProductId })}
                      activeOpacity={0.8}
                    >
                      <View style={styles.productTagIconBox}>
                        <Text style={{ fontSize: 18 }}>🏷️</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productTagTitle} numberOfLines={1}>
                          {post.linkedProductTitle || 'Tagged Craft Product'}
                        </Text>
                        {post.linkedProductPrice ? (
                          <Text style={styles.productTagPrice}>Direct from Artisan: ₹{post.linkedProductPrice.toLocaleString('en-IN')}</Text>
                        ) : (
                          <Text style={styles.productTagPrice}>Direct Artisan Listing</Text>
                        )}
                      </View>
                      <Text style={styles.productTagAction}>View In Store →</Text>
                    </TouchableOpacity>
                  )}

                  {/* Caption & Storytelling */}
                  <Text style={styles.captionText}>{post.caption}</Text>

                  {/* Social Action Footer */}
                  <View style={styles.postFooter}>
                    <View style={styles.actionGroup}>
                      <TouchableOpacity
                        style={[styles.actionBtn, post.isLikedByMe && styles.actionBtnActive]}
                        onPress={() => handleLike(post.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionIcon}>{post.isLikedByMe ? '❤️' : '🤍'}</Text>
                        <Text style={[styles.actionLabel, post.isLikedByMe && styles.actionLabelActive]}>
                          {post.likesCount}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleOpenComments(post.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionIcon}>💬</Text>
                        <Text style={styles.actionLabel}>{post.commentsCount || 0}</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => {
                          Alert.alert('Share Craft Story', `Link copied! Share ${post.artisanName}'s craft with buyers & friends.`);
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.actionIcon}>📤</Text>
                        <Text style={styles.actionLabel}>Share</Text>
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.timeText}>
                      {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* 2-Step Content Creation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  {createStep === 'choose_type' ? '✨ Create on KalaChannel' : `New ${chosenMediaType === 'video' ? 'Short Video' : 'Photo Story'}`}
                </Text>
                <Text style={styles.modalSub}>
                  {createStep === 'choose_type' ? 'Select your storytelling format' : 'Share craft techniques with patrons'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setCreateStep('choose_type');
                  setMediaUri(null);
                }}
              >
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {createStep === 'choose_type' ? (
              /* Step 1: Choose Content Type */
              <View style={styles.typeChooserWrap}>
                <Text style={styles.typeChooserInstruction}>
                  Choose how you want to present your craft to buyers and patrons:
                </Text>

                <TouchableOpacity
                  style={[styles.typeOptionCard, Shadows.soft]}
                  onPress={() => startCreationWith('video')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.typeOptionIconBox, { backgroundColor: '#EEF2FF' }]}>
                    <Text style={{ fontSize: 32 }}>🎥</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.typeTitleRow}>
                      <Text style={styles.typeOptionTitle}>Short Video Reel</Text>
                      <Text style={styles.typeBadgeReel}>ENGAGING</Text>
                    </View>
                    <Text style={styles.typeOptionDesc}>
                      Vertical clip of your loom rhythm, potter's wheel, furnace casting, or hand carving.
                    </Text>
                  </View>
                  <Text style={styles.typeArrow}>→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.typeOptionCard, Shadows.soft]}
                  onPress={() => startCreationWith('image')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.typeOptionIconBox, { backgroundColor: '#FDF2F8' }]}>
                    <Text style={{ fontSize: 32 }}>📸</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.typeTitleRow}>
                      <Text style={styles.typeOptionTitle}>Photo Story</Text>
                      <Text style={styles.typeBadgePhoto}>STORY</Text>
                    </View>
                    <Text style={styles.typeOptionDesc}>
                      High-resolution still of finished textiles, pottery glazes, natural dyes, or raw materials.
                    </Text>
                  </View>
                  <Text style={styles.typeArrow}>→</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Step 2: Enter Details & Pick Media */
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Media Selector */}
                {mediaUri ? (
                  <View style={styles.previewContainer}>
                    {chosenMediaType === 'video' ? (
                      <View style={styles.previewMediaBox}>
                        <Video
                          source={{ uri: mediaUri }}
                          style={styles.previewMedia}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay
                          isLooping
                          isMuted
                        />
                        <View style={styles.previewVideoBadge}>
                          <Text style={styles.previewVideoBadgeText}>🎥 Video Loaded</Text>
                        </View>
                      </View>
                    ) : (
                      <Image source={{ uri: mediaUri }} style={styles.previewMedia} resizeMode="cover" />
                    )}

                    <TouchableOpacity
                      style={styles.replaceBtn}
                      onPress={() => setMediaUri(null)}
                    >
                      <Text style={styles.replaceBtnText}>Replace {chosenMediaType === 'video' ? 'Video' : 'Photo'}</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.mediaPickerRow}>
                    <TouchableOpacity
                      style={styles.mediaPickerBtn}
                      onPress={() => handlePickMedia(chosenMediaType, true)}
                    >
                      <Text style={styles.mediaPickerIcon}>
                        {chosenMediaType === 'video' ? '📹' : '📸'}
                      </Text>
                      <Text style={styles.mediaPickerTitle}>Record Live</Text>
                      <Text style={styles.mediaPickerSub}>Use Camera</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.mediaPickerBtn}
                      onPress={() => handlePickMedia(chosenMediaType, false)}
                    >
                      <Text style={styles.mediaPickerIcon}>
                        {chosenMediaType === 'video' ? '🎬' : '🖼️'}
                      </Text>
                      <Text style={styles.mediaPickerTitle}>Upload File</Text>
                      <Text style={styles.mediaPickerSub}>From Gallery</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Story Type Chips */}
                <Text style={styles.inputLabel}>Story Theme</Text>
                <View style={styles.storyChipsRow}>
                  <TouchableOpacity
                    style={[styles.storyChip, storyType === 'craft_story' && styles.storyChipActive]}
                    onPress={() => setStoryType('craft_story')}
                  >
                    <Text style={[styles.storyChipText, storyType === 'craft_story' && styles.storyChipTextActive]}>
                      📜 Heritage Lore
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.storyChip, storyType === 'workshop_live' && styles.storyChipActive]}
                    onPress={() => setStoryType('workshop_live')}
                  >
                    <Text style={[styles.storyChipText, storyType === 'workshop_live' && styles.storyChipTextActive]}>
                      ⚡ Workshop Live
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.storyChip, storyType === 'behind_the_scenes' && styles.storyChipActive]}
                    onPress={() => setStoryType('behind_the_scenes')}
                  >
                    <Text style={[styles.storyChipText, storyType === 'behind_the_scenes' && styles.storyChipTextActive]}>
                      🔍 Behind The Scenes
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Caption Input */}
                <Text style={styles.inputLabel}>Craft Story & Technique Explanation</Text>
                <TextInput
                  style={styles.captionInput}
                  placeholder="Tell the story: What motifs are used? What natural ingredients or metals were chosen? How long did it take?"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={caption}
                  onChangeText={setCaption}
                />

                {/* Link Catalogue Product */}
                {products.length > 0 && (
                  <>
                    <Text style={styles.inputLabel}>Connect to Store Product (Optional)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.prodsScroll}>
                      {products.map(p => (
                        <TouchableOpacity
                          key={p.id}
                          style={[
                            styles.prodChip,
                            selectedProductId === p.id && styles.prodChipSelected,
                          ]}
                          onPress={() =>
                            setSelectedProductId(prev => (prev === p.id ? undefined : p.id))
                          }
                        >
                          <Text
                            style={[
                              styles.prodChipText,
                              selectedProductId === p.id && styles.prodChipTextSelected,
                            ]}
                            numberOfLines={1}
                          >
                            {p.info.titleHi || p.info.titleEn || 'Product'} (₹{p.pricing?.finalListingPrice || p.pricing?.suggestedRetailPrice || '—'})
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </>
                )}

                <Button
                  title={submitting ? 'Publishing...' : 'Publish to KalaChannel'}
                  onPress={handleCreatePost}
                  loading={submitting}
                  size="lg"
                  style={styles.publishBtn}
                />
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Comments Drawer Modal */}
      <Modal visible={Boolean(activeCommentsPostId)} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.commentsModalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>💬 Craft Discussion</Text>
                <Text style={styles.modalSub}>Engage directly with artisans & fellow patrons</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveCommentsPostId(null)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {loadingComments ? (
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
              ) : comments.length === 0 ? (
                <View style={styles.emptyCommentsBox}>
                  <Text style={styles.emptyCommentsEmoji}>✍️</Text>
                  <Text style={styles.emptyCommentsText}>
                    Be the first to appreciate this craftsmanship or ask about their technique!
                  </Text>
                </View>
              ) : (
                comments.map(c => (
                  <View key={c.id} style={styles.commentBubble}>
                    <View style={styles.commentAuthorRow}>
                      <Text style={styles.commentAuthor}>{c.authorName || c.userName || 'Patron'}</Text>
                      <Text style={styles.commentTime}>
                        {new Date(c.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.commentContent}>{c.content || c.commentText}</Text>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.addCommentRow}>
              <TextInput
                style={styles.commentInput}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Ask about this craft or share appreciation..."
                placeholderTextColor={Colors.textMuted}
              />
              <Button
                title={submittingComment ? '...' : 'Post'}
                onPress={handleAddComment}
                loading={submittingComment}
                size="sm"
                style={styles.sendCommentBtn}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterBar: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFF',
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 1.5,
  },
  createBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  createBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  createBannerEmoji: {
    fontSize: 28,
  },
  createBannerTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  createBannerSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    marginLeft: 8,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
  },
  discoveryBanner: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 18,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  discoveryEmoji: {
    fontSize: 26,
  },
  discoveryTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  discoverySub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  centerBox: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  postCard: {
    backgroundColor: Colors.surface,
    borderRadius: 22,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.accentGold,
    marginRight: Spacing.sm,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  headerInfo: {
    flex: 1,
  },
  artisanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  artisanName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  verifiedBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  craftMeta: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  formatPill: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  formatPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  mediaContainer: {
    width: '100%',
    backgroundColor: '#000',
  },
  videoWrapper: {
    width: '100%',
    height: 380,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  videoLoaderOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTapOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(91, 26, 66, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  playIconText: {
    color: '#FFF',
    fontSize: 24,
    marginLeft: 4,
  },
  videoControlsRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  soundControlBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundControlIcon: {
    fontSize: 16,
  },
  videoBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  videoBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  postImage: {
    width: '100%',
    height: 280,
  },
  postBody: {
    padding: Spacing.md,
  },
  productTagCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  productTagIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productTagTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
  },
  productTagPrice: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 1,
  },
  productTagAction: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
  },
  captionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: 21,
    marginBottom: Spacing.sm,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  actionBtnActive: {
    opacity: 1,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  actionLabelActive: {
    color: Colors.accent,
  },
  timeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: '800',
    color: Colors.text,
  },
  modalSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  modalClose: {
    fontSize: 22,
    color: Colors.textMuted,
    padding: 4,
  },
  typeChooserWrap: {
    paddingVertical: Spacing.md,
    gap: 14,
  },
  typeChooserInstruction: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  typeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
  },
  typeOptionIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeOptionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: '800',
    color: Colors.text,
  },
  typeBadgeReel: {
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgePhoto: {
    fontSize: 9,
    fontWeight: '800',
    backgroundColor: '#FCE7F3',
    color: '#9D174D',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeOptionDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 15,
  },
  typeArrow: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: '800',
  },
  mediaPickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  mediaPickerBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mediaPickerIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  mediaPickerTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
  },
  mediaPickerSub: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  previewContainer: {
    marginBottom: Spacing.md,
  },
  previewMediaBox: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  previewMedia: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  previewVideoBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  previewVideoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  replaceBtn: {
    alignSelf: 'center',
    marginTop: 8,
  },
  replaceBtnText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.accent,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 8,
  },
  storyChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  storyChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storyChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  storyChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  storyChipTextActive: {
    color: '#FFF',
  },
  captionInput: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: Spacing.md,
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: Spacing.sm,
  },
  prodsScroll: {
    marginBottom: Spacing.md,
  },
  prodChip: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prodChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  prodChipText: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '700',
  },
  prodChipTextSelected: {
    color: '#FFF',
  },
  publishBtn: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  commentsModalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    maxHeight: '80%',
    minHeight: '50%',
  },
  commentsList: {
    flex: 1,
    marginVertical: Spacing.sm,
  },
  emptyCommentsBox: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyCommentsEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyCommentsText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  commentBubble: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 14,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  commentAuthor: {
    fontSize: Typography.fontSize.xs,
    fontWeight: '800',
    color: Colors.text,
  },
  commentTime: {
    fontSize: 9,
    color: Colors.textMuted,
  },
  commentContent: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  addCommentRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendCommentBtn: {
    paddingHorizontal: 14,
  },
});
