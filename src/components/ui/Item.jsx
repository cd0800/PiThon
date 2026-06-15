import { Button } from "./Button";

export function Item({
  title = "Assignment draft",
  description = "Draft saved 2 hours ago.",
  media,
  actionLabel = "Open",
}) {
  const renderMedia = () => {
    if (!media) {
      return null;
    }
    if (typeof media === "string") {
      return <img src={media} alt="" loading="lazy" />;
    }
    return media;
  };

  return (
    <article className="ui-item">
      {media ? <div className="ui-item-media">{renderMedia()}</div> : null}
      <div className="ui-item-content">
        <div className="ui-item-title">{title}</div>
        <div className="ui-item-description">{description}</div>
      </div>
      <div className="ui-item-action">
        <Button size="sm" variant="secondary">
          {actionLabel}
        </Button>
      </div>
    </article>
  );
}
