import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useComments, useCreateComment, useDeleteComment } from './queries';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState, ErrorState, Loader } from '@/components/ui/States';
import { getErrorMessage } from '@/api/client';
import { formatRelative } from '@/utils/format';
import { useAuth } from '@/hooks/useAuth';

export function CommentSection({ taskId, isOwner }: { taskId: string; isOwner: boolean }) {
  const { user } = useAuth();
  const { data: comments, isLoading, isError, error, refetch } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const [text, setText] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  async function submit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    if (!text.trim()) return;
    setFormError(null);
    try {
      await createComment.mutateAsync(text.trim());
      setText('');
    } catch (submitError) {
      setFormError(getErrorMessage(submitError, 'Could not post the comment.'));
    }
  }

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900">Comments</h3>

      {isLoading && <Loader label="Loading comments…" className="py-6" />}
      {isError && <ErrorState message={getErrorMessage(error)} onRetry={() => void refetch()} />}

      {comments && comments.length === 0 && (
        <EmptyState title="No comments yet" description="Start the discussion with your team." />
      )}

      {comments && comments.length > 0 && (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <Avatar name={comment.author.name} size="sm" />
              <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-800">{comment.author.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{formatRelative(comment.createdAt)}</span>
                    {(comment.authorId === user?.id || isOwner) && (
                      <button
                        type="button"
                        aria-label="Delete comment"
                        onClick={() => void deleteComment.mutateAsync(comment.id)}
                        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{comment.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form className="space-y-2" onSubmit={submit}>
        <label htmlFor="comment-text" className="sr-only">
          Write a comment
        </label>
        <textarea
          id="comment-text"
          rows={2}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a comment…"
          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm placeholder:text-slate-400"
        />
        {formError && <p className="text-xs text-red-600">{formError}</p>}
        <div className="flex justify-end">
          <Button type="submit" size="sm" isLoading={createComment.isPending} disabled={!text.trim()}>
            Comment
          </Button>
        </div>
      </form>
    </section>
  );
}
