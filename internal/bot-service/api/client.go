package api

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type Client struct {
	baseURL string
	http    *http.Client
}

type Link struct {
	ID       string `json:"id"`
	URL      string `json:"url"`
	Resource string `json:"resource"`
}

func NewClient(baseURL string, timeout time.Duration) *Client {
	return &Client{
		baseURL: strings.TrimRight(baseURL, "/"),
		http:    &http.Client{Timeout: timeout},
	}
}

func (c *Client) CreateLink(url string) (string, error) {
	payload, err := json.Marshal(map[string]string{"url": url})
	if err != nil {
		return "", err
	}
	req, err := http.NewRequest("POST", c.baseURL+"/api/v1/links", bytes.NewReader(payload))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := c.http.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return "", fmt.Errorf("api status: %s", resp.Status)
	}
	var out struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return "", err
	}
	return out.ID, nil
}

func (c *Client) MarkViewed(id string) error {
	req, err := http.NewRequest("POST", c.baseURL+"/api/v1/links/"+id+"/viewed", nil)
	if err != nil {
		return err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("api status: %s", resp.Status)
	}
	return nil
}

func (c *Client) RandomLink(resource string) (Link, error) {
	requestURL := c.baseURL + "/api/v1/links/random"
	if resource != "" {
		requestURL += "?resource=" + url.QueryEscape(resource)
	}
	req, err := http.NewRequest("GET", requestURL, nil)
	if err != nil {
		return Link{}, err
	}
	resp, err := c.http.Do(req)
	if err != nil {
		return Link{}, err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return Link{}, fmt.Errorf("api status: %s", resp.Status)
	}
	var out Link
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return Link{}, err
	}
	return out, nil
}
