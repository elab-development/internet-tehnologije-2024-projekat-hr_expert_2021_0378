<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Performance Review #{{ $review->id }}</title>
  <style>
    body { font-family: sans-serif; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #000; padding: 8px; vertical-align: top; }
    th { background: #f0f0f0; text-align: left; }
    .center { text-align: center; }
    .no-border { border: none; }
    .circle, .circle-empty {
      display: inline-block;
      width: 12px; height: 12px; margin-right: 4px;
      border-radius: 50%;
    }
    .circle { background: #000; }
    .circle-empty { border: 1px solid #000; }
    @font-face {
      font-family: 'Meow Script';
      src: url('file://{{ public_path('fonts/MeowScript-Regular.ttf') }}') format('truetype');
      font-weight: normal;
      font-style: normal;
    }
    .signature-font {
      font-family: 'Meow Script', cursive;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <table>
    <tr>
      <th colspan="4" class="center" style="font-size:24px;">Performance Review</th>
    </tr>

    <tr>
      <th>Employee</th>
      <td>{{ $review->employee->name }}</td>
      <th>Department</th>
      <td>{{ $review->employee->department->name }}</td>
    </tr>
    <tr>
      <td colspan="4" class="center">
        <img src="{{ $review->employee->image_url }}"
             alt="Employee Picture"
             style="width:100px; height:100px; object-fit:cover; border:1px solid #000;">
      </td>
    </tr>

    <tr>
      <th>Reviewer</th>
      <td>{{ $review->reviewer->name }}</td>
      <th>Department</th>
      <td>{{ $review->reviewer->department->name }}</td>
    </tr>
    <tr>
      <td colspan="4" class="center">
        <img src="{{ $review->reviewer->image_url }}"
             alt="Reviewer Picture"
             style="width:100px; height:100px; object-fit:cover; border:1px solid #000;">
      </td>
    </tr>

    <tr>
      <th>Score</th>
      <td colspan="3">
        @for ($i = 1; $i <= 5; $i++)
          @if ($i <= $review->score)
            <span class="circle"></span>
          @else
            <span class="circle-empty"></span>
          @endif
        @endfor
      </td>
    </tr>

    <tr>
      <th>Feedback</th>
      <td colspan="3">{{ $review->feedback }}</td>
    </tr>

    <tr>
      <td colspan="2">
        <strong>Created at:</strong><br>
        {{ $review->created_at->format('Y-m-d H:i') }}
      </td>
      <td colspan="2">
        <strong>Updated at:</strong><br>
        {{ $review->updated_at->format('Y-m-d H:i') }}
      </td>
    </tr>

    <tr>
      <td class="no-border">
        @php
        $logoPath = public_path('images/hr-logo.png');
        $logoData = base64_encode(file_get_contents($logoPath));
        @endphp
    <img src="data:image/png;base64,{{ $logoData }}"
     alt="HR Logo"
     style="width:80px;">
      </td>
      <td colspan="3" class="no-border">
        <div style="float:right; text-align:center;">
          @php
            [$rFirst] = explode(' ', $review->reviewer->name);
            $rInit = strtoupper(substr(strrchr($review->reviewer->name, ' '), 1, 1));
            [$eFirst] = explode(' ', $review->employee->name);
            $eInit = strtoupper(substr(strrchr($review->employee->name, ' '), 1, 1));
          @endphp

          {{-- Signature names *above* the line --}}
          <span class="signature-font">{{ $rFirst }} {{ $rInit }}.</span><br>
          _____________________<br>
          Reviewer signature<br><br>

          <span class="signature-font">{{ $eFirst }} {{ $eInit }}.</span><br>
          _____________________<br>
          Employee signature
        </div>
      </td>
    </tr>
  </table>
</body>
</html>