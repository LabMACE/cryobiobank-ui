import { useState, useEffect, useRef, useCallback } from 'react';
import {
    TextField,
    InputAdornment,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Typography,
    Chip,
    CircularProgress,
    Popper,
    ClickAwayListener,
    Box,
    Fade,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MapIcon from '@mui/icons-material/Map';
import PlaceIcon from '@mui/icons-material/Place';
import BiotechIcon from '@mui/icons-material/Biotech';
import ScienceIcon from '@mui/icons-material/Science';
import { fetchUtils, useRedirect } from 'react-admin';

const categories = {
    areas: { label: 'Area', icon: <MapIcon fontSize="small" />, path: 'areas' },
    sites: { label: 'Site', icon: <PlaceIcon fontSize="small" />, path: 'sites' },
    site_replicates: { label: 'Replicate', icon: <PlaceIcon fontSize="small" />, path: 'site_replicates' },
    isolates: { label: 'Isolate', icon: <BiotechIcon fontSize="small" />, path: 'isolates' },
    samples: { label: 'Sample', icon: <ScienceIcon fontSize="small" />, path: 'samples' },
    dna: { label: 'DNA', icon: <ScienceIcon fontSize="small" />, path: 'dna' },
};

const getResultLabel = (category, item) => {
    if (category === 'isolates' && item.taxonomy) {
        return `${item.name} — ${item.taxonomy}`;
    }
    return item.name || item.id;
};

const relevanceScore = (name, q) => {
    const lower = (name || '').toLowerCase();
    const ql = q.toLowerCase();
    if (lower === ql) return 0;
    if (lower.startsWith(ql)) return 1;
    const idx = lower.indexOf(ql);
    if (idx >= 0) return 2 + idx;
    return 1000;
};

const flattenAndSort = (results, q) => {
    const flat = [];
    for (const [key, items] of Object.entries(results)) {
        if (!categories[key]) continue;
        for (const item of items) {
            flat.push({ ...item, _category: key });
        }
    }
    flat.sort((a, b) => {
        const diff = relevanceScore(a.name, q) - relevanceScore(b.name, q);
        if (diff !== 0) return diff;
        return (a.name || '').localeCompare(b.name || '');
    });
    return flat;
};

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [open, setOpen] = useState(false);
    const inputRef = useRef(null);
    const anchorRef = useRef(null);
    const redirect = useRedirect();
    const debounceRef = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, []);

    const doSearch = useCallback((q) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (q.trim().length < 2) {
            setResults(null);
            setOpen(false);
            return;
        }
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            setSearchError(null);
            try {
                const { json } = await fetchUtils.fetchJson(
                    `/api/search?q=${encodeURIComponent(q.trim())}`
                );
                setResults(json);
                setOpen(json.total > 0);
            } catch (err) {
                setSearchError(err.message || 'Search failed');
                setResults(null);
                setOpen(true);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, []);

    const handleChange = (e) => {
        const v = e.target.value;
        setQuery(v);
        doSearch(v);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setOpen(false);
            inputRef.current?.blur();
        }
    };

    const handleSelect = (resource, id) => {
        setOpen(false);
        setQuery('');
        setResults(null);
        redirect('show', resource, id);
    };

    const showNoResults = !loading && !searchError && query.trim().length >= 2 && results?.total === 0;

    return (
        <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Box ref={anchorRef} sx={{ position: 'relative', mx: 2 }}>
                <TextField
                    inputRef={inputRef}
                    size="small"
                    placeholder="Search..."
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (results && results.total > 0) setOpen(true);
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                </InputAdornment>
                            ),
                            endAdornment: loading ? (
                                <InputAdornment position="end">
                                    <CircularProgress size={16} sx={{ color: 'rgba(255,255,255,0.7)' }} />
                                </InputAdornment>
                            ) : (
                                <InputAdornment position="end">
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            border: '1px solid rgba(255,255,255,0.3)',
                                            borderRadius: 0.5,
                                            px: 0.5,
                                            fontSize: '0.65rem',
                                            color: 'rgba(255,255,255,0.5)',
                                            lineHeight: 1.6,
                                        }}
                                    >
                                        Ctrl+K
                                    </Typography>
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        width: 280,
                        '& .MuiOutlinedInput-root': {
                            color: 'white',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.5)' },
                            '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: 'rgba(255,255,255,0.5)',
                            opacity: 1,
                        },
                    }}
                />
                <Popper
                    open={open || showNoResults || !!searchError}
                    anchorEl={anchorRef.current}
                    placement="bottom-start"
                    transition
                    style={{ zIndex: 1300 }}
                >
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={150}>
                            <Paper
                                elevation={8}
                                sx={{ width: 360, maxHeight: 420, overflow: 'auto', mt: 0.5 }}
                            >
                                {searchError ? (
                                    <Typography sx={{ p: 2 }} color="error" variant="body2">
                                        {searchError}
                                    </Typography>
                                ) : showNoResults ? (
                                    <Typography sx={{ p: 2, color: 'text.secondary' }}>
                                        No results for &quot;{query.trim()}&quot;
                                    </Typography>
                                ) : (
                                    <List dense disablePadding>
                                        {(results?.results ? flattenAndSort(results.results, query) : []).map((item) => {
                                            const cat = categories[item._category];
                                            return (
                                                <ListItemButton
                                                    key={`${item._category}-${item.id}`}
                                                    onClick={() => handleSelect(cat.path, item.id)}
                                                    sx={{ pl: 2 }}
                                                >
                                                    <Box sx={{ mr: 1, display: 'flex', color: 'text.secondary' }}>
                                                        {cat.icon}
                                                    </Box>
                                                    <ListItemText
                                                        primary={getResultLabel(item._category, item)}
                                                        primaryTypographyProps={{ noWrap: true, fontSize: '0.875rem' }}
                                                    />
                                                    <Chip
                                                        label={cat.label}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ ml: 1, fontSize: '0.65rem', height: 20 }}
                                                    />
                                                </ListItemButton>
                                            );
                                        })}
                                    </List>
                                )}
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </Box>
        </ClickAwayListener>
    );
}
