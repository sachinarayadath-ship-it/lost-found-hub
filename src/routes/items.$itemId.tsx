import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle,
  Handshake,
  Loader2,
  Lock,
  MapPin,
  MessageCircle,
  Send,
  Shapes,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { KindBadge, StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatDateTime } from "@/lib/format";
import { claimsApi, itemsApi, messagesApi } from "@/services/api";
import { useAppSelector } from "@/store";

export const Route = createFileRoute("/items/$itemId")({
  validateSearch: (search: Record<string, unknown>) => ({
    chat: search.chat === "true" || search.chat === true || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Item details · LostFound+" },
      {
        name: "description",
        content:
          "See full details for a reported lost or found item, message the reporter privately and open a verified claim.",
      },
      { property: "og:title", content: "Item details · LostFound+" },
      {
        property: "og:description",
        content: "Full item details, private messaging and verified claims.",
      },
    ],
  }),
  component: ItemDetailsPage,
});

function ItemDetailsPage() {
  const { itemId } = Route.useParams();
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const user = useAppSelector((s) => s.auth.user);
  const [claimMessage, setClaimMessage] = useState("");
  const [reply, setReply] = useState("");
  const [claimOpen, setClaimOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(!!search.chat);
  const [resolveOpen, setResolveOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => itemsApi.get(itemId),
  });

  const isOwner = user && item ? item.reporter._id === user._id : false;

  const { data: thread } = useQuery({
    queryKey: ["messages", itemId],
    queryFn: () => messagesApi.thread(itemId),
    enabled: !!user && chatOpen,
  });

  const { data: claims } = useQuery({
    queryKey: ["item-claims", itemId],
    queryFn: () => claimsApi.itemClaims(itemId),
    enabled: !!user && isOwner,
  });

  const claim = useMutation({
    mutationFn: () => claimsApi.create(itemId, claimMessage),
    onSuccess: () => {
      toast.success("Claim submitted — a moderator will review it shortly.");
      setClaimOpen(false);
      setClaimMessage("");
      void queryClient.invalidateQueries({ queryKey: ["item", itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const approveClaim = useMutation({
    mutationFn: (claimId: string) => claimsApi.approve(claimId),
    onSuccess: () => {
      toast.success("Claim approved! The item is now marked as resolved.");
      void queryClient.invalidateQueries({ queryKey: ["item", itemId] });
      void queryClient.invalidateQueries({ queryKey: ["item-claims", itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rejectClaim = useMutation({
    mutationFn: (claimId: string) => claimsApi.reject(claimId),
    onSuccess: () => {
      toast.success("Claim rejected.");
      void queryClient.invalidateQueries({ queryKey: ["item-claims", itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const sendMessage = useMutation({
    mutationFn: () => messagesApi.send(itemId, reply),
    onSuccess: () => {
      setReply("");
      void queryClient.invalidateQueries({ queryKey: ["messages", itemId] });
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resolveItem = useMutation({
    mutationFn: () => itemsApi.update(itemId, { status: "resolved" }),
    onSuccess: () => {
      toast.success("Item marked as claimed! Thank you for updating.");
      setResolveOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["item", itemId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (reply.trim().length < 2) return;
      sendMessage.mutate();
    },
    [reply, sendMessage],
  );

  if (isLoading || !item) {
    return (
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="aspect-4/3 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  const isResolved = item.status === "resolved";

  return (
    <div className="container-page py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/browse">
          <ArrowLeft className="size-4" /> Back to listings
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="aspect-4/3 w-full object-cover"
              />
            ) : (
              <div className="grid aspect-4/3 place-items-center bg-surface text-sm text-muted-foreground">
                No photo provided
              </div>
            )}
          </div>

          <Card className="gap-4 p-6 shadow-card">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            <dl className="mt-2 grid gap-4 sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  <Shapes className="size-3.5" /> Category
                </dt>
                <dd className="mt-1 truncate text-sm font-medium">{item.category}</dd>
              </div>
              <div className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  <MapPin className="size-3.5" /> Location
                </dt>
                <dd className="mt-1 truncate text-sm font-medium">{item.location}</dd>
              </div>
              <div className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                  <CalendarDays className="size-3.5" /> Date
                </dt>
                <dd className="mt-1 text-sm font-medium">{formatDate(item.date)}</dd>
              </div>
            </dl>
          </Card>

          {/* Claims History Panel for Owner */}
          {isOwner && claims && claims.length > 0 ? (
            <Card className="gap-4 p-6 shadow-card">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                <Handshake className="size-5" /> Claims History
              </h2>
              <div className="divide-y divide-border space-y-4">
                {claims.map((c) => (
                  <div key={c._id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {c.claimedBy?.name || "Anonymous Claimant"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.claimedBy?.email || "No email"} • {c.claimedBy?.phone || "No phone"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={c.status} size="sm" />
                        {c.status === "pending" && !isResolved ? (
                          <div className="flex gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => approveClaim.mutate(c._id)}
                              disabled={approveClaim.isPending || rejectClaim.isPending}
                              aria-label="Approve claim"
                            >
                              {approveClaim.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/5"
                              onClick={() => rejectClaim.mutate(c._id)}
                              disabled={approveClaim.isPending || rejectClaim.isPending}
                              aria-label="Reject claim"
                            >
                              {rejectClaim.isPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <X className="size-4" />
                              )}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-surface/50 p-3.5 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Verification message
                      </p>
                      <p className="text-foreground italic">"{c.message}"</p>
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Submitted on {formatDateTime(c.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          ) : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <Card className="gap-4 p-6 shadow-card">
            <div className="flex flex-wrap items-center gap-2">
              <KindBadge kind={item.kind} />
              <StatusBadge status={item.status} size="md" />
            </div>
            <h1 className="text-2xl leading-tight font-bold">{item.title}</h1>
            <p className="text-sm text-muted-foreground">
              Reported by <span className="font-medium text-foreground">{item.reporter.name}</span> ·{" "}
              {formatDate(item.createdAt)}
            </p>

            {/* ---- Action Buttons ---- */}
            <div className="space-y-2.5">
              {/* Claim Button */}
              <Dialog open={claimOpen} onOpenChange={setClaimOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full" size="lg" disabled={isResolved || !!isOwner}>
                    <Handshake className="size-4" />
                    {isResolved ? "Already resolved" : isOwner ? "This is your report" : "Claim this item"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Claim "{item.title}"</DialogTitle>
                    <DialogDescription>
                      Describe something identifying about the item. A moderator uses this to verify
                      ownership before handover.
                    </DialogDescription>
                  </DialogHeader>
                  <Textarea
                    value={claimMessage}
                    onChange={(e) => setClaimMessage(e.target.value)}
                    rows={4}
                    maxLength={600}
                    placeholder="e.g. There's a boarding pass from 12 July inside the front pocket."
                  />
                  <DialogFooter>
                    <Button variant="ghost" onClick={() => setClaimOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={() => claim.mutate()}
                      disabled={claimMessage.trim().length < 10 || claim.isPending}
                    >
                      {claim.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                      Submit claim
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Message Popup Button */}
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={() => {
                  if (!user) {
                    toast.error("Sign in to message the reporter.");
                    return;
                  }
                  setChatOpen(true);
                }}
              >
                <MessageCircle className="size-4" />
                Message {isOwner ? "claimants" : "reporter"}
              </Button>

              {/* Owner: Mark as claimed */}
              {isOwner && !isResolved ? (
                <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
                  <DialogTrigger asChild>
                    <Button variant="accent" className="w-full" size="lg">
                      <CheckCircle className="size-4" />
                      Item claimed by owner
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Mark as claimed?</DialogTitle>
                      <DialogDescription>
                        This will mark "{item.title}" as <strong>resolved</strong>. Other users will
                        no longer be able to submit claims on it.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setResolveOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => resolveItem.mutate()}
                        disabled={resolveItem.isPending}
                      >
                        {resolveItem.isPending ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle className="size-4" />}
                        Yes, mark as claimed
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>

            <p className="text-xs text-muted-foreground">
              {item.claimCount} claim{item.claimCount === 1 ? "" : "s"} on this item so far.
            </p>
          </Card>

          <Card className="gap-3 bg-surface/60 p-6">
            <h2 className="text-sm font-semibold">How handover works</h2>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Submit a claim with a verification detail.</li>
              <li>2. A moderator reviews the claim and the item report.</li>
              <li>3. You're notified with a collection point and time.</li>
            </ol>
          </Card>
        </aside>
      </div>

      {/* ---- Floating Chat Popup ---- */}
      {chatOpen && user ? (
        <div className="fixed right-4 bottom-4 z-50 flex w-[22rem] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lift sm:right-6 sm:bottom-6 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3 text-primary-foreground">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {isOwner ? "Messages about your item" : `Message ${item.reporter.name}`}
              </p>
              <p className="flex items-center gap-1 text-[0.7rem] opacity-80">
                <Lock className="size-3" /> Private · contact details hidden
              </p>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="grid size-8 shrink-0 place-items-center rounded-full transition-colors hover:bg-primary-foreground/20"
              aria-label="Close chat"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex max-h-72 flex-1 flex-col gap-2 overflow-y-auto p-4">
            {!thread || thread.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No messages yet. Start the conversation below.
              </p>
            ) : (
              thread.map((message) => (
                <div
                  key={message._id}
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                    message.mine
                      ? "ml-auto rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-surface text-surface-foreground"
                  }`}
                >
                  <p>{message.body}</p>
                  <p
                    className={`mt-0.5 text-[0.65rem] ${message.mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}
                  >
                    {message.author} · {formatDateTime(message.createdAt)}
                  </p>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Reply Input */}
          <form
            onSubmit={handleSendMessage}
            className="flex items-end gap-2 border-t border-border bg-background p-3"
          >
            <Textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type a message…"
              rows={1}
              maxLength={500}
              className="min-h-[2.5rem] min-w-0 flex-1 resize-none text-sm"
            />
            <Button
              type="submit"
              size="icon"
              className="size-9 shrink-0"
              disabled={reply.trim().length < 2 || sendMessage.isPending}
              aria-label="Send message"
            >
              {sendMessage.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
