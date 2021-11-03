import logging
import os
import telegram

BOT_TOKEN = os.environ.get('BOT_TOKEN')

logger = logging.getLogger()
if logger.handlers:
    for handler in logger.handlers:
        logger.removeHandler(handler)

logging.basicConfig(level=logging.INFO)


def configure_telegram():
    """
    Configures the bot with a Telegram Token.
    Returns a bot instance.
    """
    if not BOT_TOKEN:
        logger.error('The BOT_TOKEN must be set')
        raise NotImplementedError

    return telegram.Bot(BOT_TOKEN)


def send_log_message(message):
    bot = configure_telegram()
    chat_id = '-414675060'

    bot.sendMessage(chat_id=chat_id, text=message)

def tglog(message):
    bot = configure_telegram()
    chat_id = '293534239'

    bot.sendMessage(chat_id=chat_id, text=message)
