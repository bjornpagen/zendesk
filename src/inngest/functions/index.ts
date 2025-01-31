import { aiReplyFunction } from "./ai-reply"
import {
	problemCategories,
	reclassifyAll,
	classifyThread
} from "./problem-categories"

export const functions = [
	aiReplyFunction,
	problemCategories,
	reclassifyAll,
	classifyThread
]
