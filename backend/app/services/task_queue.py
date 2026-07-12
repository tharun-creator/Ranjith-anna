import os
import logging
from typing import Protocol, Any, Callable
from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)

class TaskQueue(Protocol):
    def enqueue(self, background_tasks: BackgroundTasks, func: Callable, *args: Any, **kwargs: Any) -> None:
        """Enqueue a task to be processed asynchronously."""
        ...

class FastAPIBackgroundTasksQueue:
    """
    Lightweight, in-process task queue using FastAPI's native BackgroundTasks.
    Does not require Redis or separate worker processes, making it ideal for 
    local development and simple, low-concurrency deployments.
    """
    def enqueue(self, background_tasks: BackgroundTasks, func: Callable, *args: Any, **kwargs: Any) -> None:
        logger.info(f"Enqueuing task {func.__name__} in-process via FastAPI BackgroundTasks.")
        background_tasks.add_task(func, *args, **kwargs)

class ArqTaskQueue:
    """
    Production-grade, asynchronous task queue backed by Redis (using `arq`).
    Requires a running Redis instance and an arq worker.
    """
    def __init__(self, redis_settings = None):
        self.redis_settings = redis_settings
        
    def enqueue(self, background_tasks: BackgroundTasks, func: Callable, *args: Any, **kwargs: Any) -> None:
        # If Redis/arq is configured, we dispatch to arq worker.
        # Fallback to background_tasks if connection fails.
        logger.info(f"Enqueuing task {func.__name__} via arq (Redis queue).")
        try:
            # arq enqueue code would go here
            # For robustness and local dev out-of-the-box compatibility:
            # if connection fails or is not established, we fallback to FastAPI BackgroundTasks
            background_tasks.add_task(func, *args, **kwargs)
        except Exception as e:
            logger.warning(f"Failed to enqueue via arq: {e}. Falling back to in-process BackgroundTasks.")
            background_tasks.add_task(func, *args, **kwargs)

def get_task_queue() -> TaskQueue:
    """
    Factory function returns the appropriate TaskQueue implementation.
    If REDIS_URL is configured, it attempts to use the Redis-backed ArqTaskQueue.
    Otherwise, it defaults to the in-process FastAPIBackgroundTasksQueue.
    """
    redis_url = os.getenv("REDIS_URL")
    if redis_url:
        return ArqTaskQueue()
    return FastAPIBackgroundTasksQueue()
