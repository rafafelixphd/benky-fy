import logging
import sys
from typing import Optional

from colorama import Fore, Style, init

# Initialize colorama
init(autoreset=True)

_loggers = {}


class ColoredFormatter(logging.Formatter):
    """Custom formatter with colors and emojis."""

    # Emoji mapping for log levels
    EMOJIS = {"DEBUG": "🔍", "INFO": "✨", "WARNING": "⚠️", "ERROR": "❌", "CRITICAL": "🔥"}

    # Color mapping for log levels
    COLORS = {
        "DEBUG": Fore.CYAN,
        "INFO": Fore.GREEN,
        "WARNING": Fore.YELLOW,
        "ERROR": Fore.RED,
        "CRITICAL": Fore.RED + Style.BRIGHT,
    }

    def format(self, record):
        # Get emoji and color for level
        emoji = self.EMOJIS.get(record.levelname, "📝")
        color = self.COLORS.get(record.levelname, "")

        # Format timestamp
        timestamp = self.formatTime(record, "%Y-%m-%d %H:%M:%S")

        # Build colored log message
        log_msg = (
            f"{Fore.WHITE}{timestamp}{Style.RESET_ALL} "
            f"{emoji} "
            f"{color}{record.levelname:8}{Style.RESET_ALL} "
            f"{Fore.BLUE}[{record.name}]{Style.RESET_ALL} "
            f"{record.getMessage()}"
        )

        # Add exception info if present
        if record.exc_info:
            log_msg += "\n" + self.formatException(record.exc_info)

        return log_msg


def setup_logger(
    name: str = "benkyfy", level: int = logging.INFO, format_string: Optional[str] = None
) -> logging.Logger:
    """
    Setup and configure a logger instance with colors and emojis.

    Args:
        name: Logger name
        level: Logging level
        format_string: Custom format string (optional, ignored when using colored formatter)

    Returns:
        Configured logger instance
    """
    if name in _loggers:
        return _loggers[name]

    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)

        # Use colored formatter
        formatter = ColoredFormatter()
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    _loggers[name] = logger
    return logger


def get_logger(name: str = "benkyfy") -> logging.Logger:
    """
    Get or create a logger instance.

    Args:
        name: Logger name (typically __name__)

    Returns:
        Logger instance
    """
    if name not in _loggers:
        return setup_logger(name)
    return _loggers[name]
