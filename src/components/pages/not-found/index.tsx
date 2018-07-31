import * as React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div>
      <h1>Page not available</h1>
      <div className="row">
        <div className="col-xs-12">
          <p>
            Return to the <Link to="/">tool</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
