import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { FacebookShareButton, TwitterShareButton, EmailShareButton } from 'react-share';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';

const SocialShareButtons: React.FC<{ url: string; title: string }> = ({ url, title }) => {
  return (
    <span>
      <Tooltip title="Share on Facebook">
        <IconButton>
          <FacebookShareButton url={url} title={title}>
            <FacebookIcon />
          </FacebookShareButton>
        </IconButton>
      </Tooltip>

      <Tooltip title="Share on Twitter">
        <IconButton>
          <TwitterShareButton url={url} title={title}>
            <TwitterIcon />
          </TwitterShareButton>
        </IconButton>
      </Tooltip>

      <Tooltip title="Share via Email">
        <IconButton>
          <EmailShareButton url={url} subject={title} body="Check out this activity!">
            <EmailIcon />
          </EmailShareButton>
        </IconButton>
      </Tooltip>
    </span>
  );
};

export default SocialShareButtons;
