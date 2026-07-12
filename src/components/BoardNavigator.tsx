import type { BoardSection } from '../types/board'

type Props = {
  boards: BoardSection[]
  selectedBoardId: string | null
  onSelectBoard: (board: BoardSection) => void
}

export default function BoardNavigator({
  boards,
  selectedBoardId,
  onSelectBoard,
}: Props) {
  return (
    <section className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-800">
        板子導航
      </h2>

      <div className="grid grid-cols-4 gap-2">
        {boards.map((board) => (
<button
  key={board.id}
  type="button"
  onClick={() => onSelectBoard(board)}
  className={`rounded-lg border px-3 py-2 font-semibold transition-colors ${
    selectedBoardId === board.id
      ? 'border-violet-600 bg-violet-600 text-white'
      : 'border-violet-300 bg-white text-violet-700 hover:bg-violet-100'
  }`}
>
  {board.id}
</button>
        ))}
      </div>
    </section>
  )
}