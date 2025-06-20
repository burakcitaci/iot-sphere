import { CentralLoggerService } from '@gateway/otel-library';
import { Controller, Get, Post, Body } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';

const LOG_LEVELS = ['error', 'warn', 'log', 'debug', 'verbose'] as const;
type LogLevel = typeof LOG_LEVELS[number];

@Controller('log-level')
export class LogLevelController {
  private static app: INestApplication;
  private static currentLevel: LogLevel = 'log';

  static setApp(app: INestApplication) {
    LogLevelController.app = app;
  }

  static setLogLevel(level: LogLevel) {
    if (LogLevelController.app) {
      LogLevelController.app.useLogger(LOG_LEVELS.slice(0, LOG_LEVELS.indexOf(level) + 1));
      LogLevelController.currentLevel = level;
      Logger.log(`Log level set to: ${level}`);
    }
  }

  @Get()
  getLogLevel() {
    return { level: LogLevelController.currentLevel };
  }

  @Post()
  setLogLevel(@Body('level') level: LogLevel) {
    if (!LOG_LEVELS.includes(level)) {
      return { success: false, message: 'Invalid log level' };
    }
    LogLevelController.setLogLevel(level);
    return { success: true, level };
  }

  @Post('increase')
  increaseLogLevel() {
    const idx = LOG_LEVELS.indexOf(LogLevelController.currentLevel);
    if (idx < LOG_LEVELS.length - 1) {
      const newLevel = LOG_LEVELS[idx + 1];
      LogLevelController.setLogLevel(newLevel);
      return { success: true, level: newLevel };
    }
    return { success: false, message: 'Already at maximum log level', level: LogLevelController.currentLevel };
  }

  @Post('decrease')
  decreaseLogLevel() {
    const idx = LOG_LEVELS.indexOf(LogLevelController.currentLevel);
    if (idx > 0) {
      const newLevel = LOG_LEVELS[idx - 1];
      LogLevelController.setLogLevel(newLevel);
      return { success: true, level: newLevel };
    }
    return { success: false, message: 'Already at minimum log level', level: LogLevelController.currentLevel };
  }
} 