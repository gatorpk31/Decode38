// ══════════════════════════════════════════════════════════════════
// Decode38 — Donations & Feedback
// ══════════════════════════════════════════════════════════════════
Decode38.DonateFeedback = {

  _selectedRating: 0,

  init: function() {
    this._bindDonation();
    this._bindFeedback();
    this._loadApprovedReviews();
    this._checkDonationReturn();
  },

  // ── Donation ──────────────────────────────────────────────────

  _bindDonation: function() {
    var amountInput = document.getElementById('donateAmount');
    var self = this;

    // Preset amount buttons
    document.querySelectorAll('.donate-amt').forEach(function(btn) {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.donate-amt').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        amountInput.value = btn.dataset.amount;
      });
    });

    // Custom input clears preset selection
    amountInput.addEventListener('input', function() {
      document.querySelectorAll('.donate-amt').forEach(function(b) { b.classList.remove('active'); });
    });

    // Donate button
    var donateBtn = document.getElementById('donateBtn');
    if (donateBtn) {
      donateBtn.addEventListener('click', function() { self._processDonation(); });
    }
  },

  _processDonation: function() {
    var amount = document.getElementById('donateAmount').value;
    var status = document.getElementById('donateStatus');
    var btn = document.getElementById('donateBtn');

    if (!amount || Number(amount) < 1) {
      status.textContent = 'Please select or enter an amount ($1 minimum).';
      status.style.color = '#EF4444';
      return;
    }

    btn.textContent = 'Processing...';
    btn.disabled = true;
    status.textContent = '';

    fetch('/api/create-donation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount) })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.url) {
          window.location.href = data.url;
        } else {
          status.textContent = data.error || 'Something went wrong. Please try again.';
          status.style.color = '#EF4444';
          btn.textContent = 'Donate';
          btn.disabled = false;
        }
      })
      .catch(function() {
        status.textContent = 'Connection error. Please try again.';
        status.style.color = '#EF4444';
        btn.textContent = 'Donate';
        btn.disabled = false;
      });
  },

  _checkDonationReturn: function() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('donation') === 'success') {
      var status = document.getElementById('donateStatus');
      if (status) {
        status.textContent = 'Thank you for your generous donation! You are helping keep Decode38 free for all veterans.';
        status.style.color = '#22C55E';
      }
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      // Scroll to donation section
      var section = document.getElementById('donateSection');
      if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  // ── Feedback ──────────────────────────────────────────────────

  _bindFeedback: function() {
    var self = this;

    // Star rating
    document.querySelectorAll('.fb-star').forEach(function(star) {
      star.addEventListener('click', function() {
        self._selectedRating = Number(star.dataset.rating);
        self._updateStars();
      });
      star.addEventListener('mouseenter', function() {
        self._highlightStars(Number(star.dataset.rating));
      });
    });

    var starsContainer = document.getElementById('fbStars');
    if (starsContainer) {
      starsContainer.addEventListener('mouseleave', function() {
        self._updateStars();
      });
    }

    // Submit
    var submitBtn = document.getElementById('fbSubmit');
    if (submitBtn) {
      submitBtn.addEventListener('click', function() { self._submitFeedback(); });
    }
  },

  _highlightStars: function(n) {
    document.querySelectorAll('.fb-star').forEach(function(star, i) {
      star.textContent = i < n ? '\u2605' : '\u2606';
      star.classList.toggle('lit', i < n);
    });
  },

  _updateStars: function() {
    this._highlightStars(this._selectedRating);
  },

  _submitFeedback: function() {
    var name = document.getElementById('fbName').value.trim();
    var email = document.getElementById('fbEmail').value.trim();
    var message = document.getElementById('fbMessage').value.trim();
    var status = document.getElementById('fbStatus');
    var btn = document.getElementById('fbSubmit');

    if (this._selectedRating === 0) {
      status.textContent = 'Please select a star rating.';
      status.style.color = '#EF4444';
      return;
    }
    if (!message || message.length < 5) {
      status.textContent = 'Please write at least a short message.';
      status.style.color = '#EF4444';
      return;
    }

    btn.textContent = 'Submitting...';
    btn.disabled = true;
    status.textContent = '';

    fetch('/api/submit-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name || 'Anonymous',
        email: email,
        rating: this._selectedRating,
        message: message
      })
    })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.success) {
          status.textContent = 'Thank you for your feedback! It will appear on the site after review.';
          status.style.color = '#22C55E';
          // Reset form
          document.getElementById('fbName').value = '';
          document.getElementById('fbEmail').value = '';
          document.getElementById('fbMessage').value = '';
          Decode38.DonateFeedback._selectedRating = 0;
          Decode38.DonateFeedback._updateStars();
        } else {
          status.textContent = data.error || 'Something went wrong.';
          status.style.color = '#EF4444';
        }
        btn.textContent = 'Submit Feedback';
        btn.disabled = false;
      })
      .catch(function() {
        status.textContent = 'Connection error. Please try again.';
        status.style.color = '#EF4444';
        btn.textContent = 'Submit Feedback';
        btn.disabled = false;
      });
  },

  // ── Approved Reviews (public) ─────────────────────────────────

  _loadApprovedReviews: function() {
    var grid = document.getElementById('reviewsGrid');
    if (!grid) return;

    fetch('/api/approved-reviews')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        var reviews = data.reviews || [];
        if (reviews.length === 0) {
          grid.innerHTML = '<div class="reviews-empty">No reviews yet. Be the first to share your experience!</div>';
          return;
        }
        var html = '';
        reviews.forEach(function(r) {
          var stars = '';
          for (var i = 0; i < 5; i++) stars += i < r.rating ? '\u2605' : '\u2606';
          var date = new Date(r.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          html += '<div class="review-card">' +
            '<div class="review-stars">' + stars + '</div>' +
            '<div class="review-msg">' + Decode38.UI.esc(r.message) + '</div>' +
            '<div class="review-meta">' + Decode38.UI.esc(r.name) + ' &middot; ' + date + '</div>' +
          '</div>';
        });
        grid.innerHTML = html;
      })
      .catch(function() {
        grid.innerHTML = '<div class="reviews-empty">Reviews are temporarily unavailable.</div>';
      });
  }
};
