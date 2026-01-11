package bot

import (
	"strings"

	"github.com/danilovid/linkkeeper/internal/bot-service/api"
	"github.com/danilovid/linkkeeper/pkg/logger"
	tb "gopkg.in/telebot.v4"
	"gopkg.in/telebot.v4/middleware"
)

type Wrapper struct {
	bot    *tb.Bot
	config *Config
	api    *api.Client
}

var (
	menu = &tb.ReplyMarkup{ResizeKeyboard: true}

	btnSave          = menu.Text("💾 Save link")
	btnViewed        = menu.Text("✅ Mark viewed")
	btnRandom        = menu.Text("🎲 Random")
	btnRandomArticle = menu.Text("📰 Random article")
	btnRandomVideo   = menu.Text("🎬 Random video")
)

func NewWrapper(config *Config) (*Wrapper, error) {
	if err := config.Validate(); err != nil {
		return nil, err
	}

	settings := tb.Settings{
		Token:  config.Token,
		Poller: &tb.LongPoller{Timeout: config.Timeout},
	}

	b, err := tb.NewBot(settings)
	if err != nil {
		return nil, err
	}

	b.Use(middleware.Logger())
	b.Use(middleware.AutoRespond())

	w := &Wrapper{
		bot:    b,
		config: config,
		api:    api.NewClient(config.APIBaseURL, config.Timeout),
	}
	w.prepare()
	return w, nil
}

func (w *Wrapper) Start() error {
	w.bot.Start()
	return nil
}

func (w *Wrapper) prepare() {
	menu.Reply(
		menu.Row(btnSave, btnViewed),
		menu.Row(btnRandom),
		menu.Row(btnRandomArticle, btnRandomVideo),
	)

	w.bot.Handle("/start", func(c tb.Context) error {
		return c.Send("Choose an action:", menu)
	})

	w.bot.Handle("/save", func(c tb.Context) error {
		url := strings.TrimSpace(c.Message().Payload)
		if url == "" {
			return c.Send("usage: /save <url>")
		}
		id, err := w.api.CreateLink(url)
		if err != nil {
			logger.L().Error().Err(err).Str("url", url).Msg("create link failed")
			return c.Send("failed to save link")
		}
		return c.Send("saved ✅ id: " + id)
	})

	w.bot.Handle("/viewed", func(c tb.Context) error {
		id := strings.TrimSpace(c.Message().Payload)
		if id == "" {
			return c.Send("usage: /viewed <id>")
		}
		if err := w.api.MarkViewed(id); err != nil {
			logger.L().Error().Err(err).Str("id", id).Msg("mark viewed failed")
			return c.Send("failed to mark viewed")
		}
		return c.Send("marked viewed ✅")
	})

	w.bot.Handle("/random", func(c tb.Context) error {
		resource := strings.TrimSpace(c.Message().Payload)
		link, err := w.api.RandomLink(resource)
		if err != nil {
			logger.L().Error().Err(err).Str("resource", resource).Msg("random link failed")
			return c.Send("failed to get random link")
		}
		if link.URL == "" {
			return c.Send("no links found")
		}
		msg := "random ✅\n" + link.URL + "\nID: " + link.ID
		if link.Resource != "" {
			msg += "\nResource: " + link.Resource
		}
		return c.Send(msg, menu)
	})

	w.bot.Handle(&btnSave, func(c tb.Context) error {
		return c.Send("Send link: /save <url>", menu)
	})

	w.bot.Handle(&btnViewed, func(c tb.Context) error {
		return c.Send("Send id: /viewed <id>", menu)
	})

	w.bot.Handle(&btnRandom, func(c tb.Context) error {
		link, err := w.api.RandomLink("")
		if err != nil {
			logger.L().Error().Err(err).Msg("random link failed")
			return c.Send("failed to get random link", menu)
		}
		if link.URL == "" {
			return c.Send("no links found", menu)
		}
		msg := "random ✅\n" + link.URL + "\nID: " + link.ID
		if link.Resource != "" {
			msg += "\nResource: " + link.Resource
		}
		return c.Send(msg, menu)
	})

	w.bot.Handle(&btnRandomArticle, func(c tb.Context) error {
		link, err := w.api.RandomLink("article")
		if err != nil {
			logger.L().Error().Err(err).Msg("random article failed")
			return c.Send("failed to get random article", menu)
		}
		if link.URL == "" {
			return c.Send("no articles found", menu)
		}
		msg := "random ✅\n" + link.URL + "\nID: " + link.ID + "\nResource: article"
		return c.Send(msg, menu)
	})

	w.bot.Handle(&btnRandomVideo, func(c tb.Context) error {
		link, err := w.api.RandomLink("video")
		if err != nil {
			logger.L().Error().Err(err).Msg("random video failed")
			return c.Send("failed to get random video", menu)
		}
		if link.URL == "" {
			return c.Send("no videos found", menu)
		}
		msg := "random ✅\n" + link.URL + "\nID: " + link.ID + "\nResource: video"
		return c.Send(msg, menu)
	})

	w.bot.Handle(tb.OnText, func(c tb.Context) error {
		text := strings.TrimSpace(c.Text())
		if text == "" {
			return nil
		}
		if strings.HasPrefix(text, "/") {
			return c.Send("unknown command, try /save, /viewed, /random", menu)
		}
		return c.Send("commands: /save <url>, /viewed <id>, /random [resource]", menu)
	})

	w.bot.Handle(tb.OnPhoto, func(c tb.Context) error {
		return c.Send("commands: /save <url>, /viewed <id>, /random [resource]", menu)
	})

	// reserved for future middleware
}
