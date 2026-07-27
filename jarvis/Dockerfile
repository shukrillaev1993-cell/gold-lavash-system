# Используем официальный образ Node.js в качестве базового
FROM node:20

# Устанавливаем ffmpeg для конвертации аудио
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Создаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код проекта
COPY . .

# Собираем TypeScript в JavaScript
RUN npm run build

# Открываем порт 7860 для Hugging Face Spaces
EXPOSE 7860

# Указываем порт в окружении
ENV PORT=7860

# Команда для запуска Telegram-бота
CMD ["npm", "run", "bot"]
