import { getAllTodos } from "../../../actions/eos";
import { TodoList } from "../../../../components/eos/todo-list";

export const dynamic = "force-dynamic";

export default async function TodosPage() {
  const todoList = await getAllTodos();

  const serialized = todoList.map((t) => ({
    id: t.id,
    title: t.title,
    ownerName: t.ownerName,
    dueDate: t.dueDate,
    completed: t.completed,
    sourceType: t.sourceType,
    sourceId: t.sourceId,
  }));

  return <TodoList todos={serialized} />;
}
